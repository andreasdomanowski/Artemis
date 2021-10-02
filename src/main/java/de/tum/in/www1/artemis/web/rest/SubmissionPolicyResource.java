package de.tum.in.www1.artemis.web.rest;

import de.tum.in.www1.artemis.domain.ProgrammingExercise;
import de.tum.in.www1.artemis.domain.submissionpolicy.SubmissionPolicy;
import de.tum.in.www1.artemis.repository.ProgrammingExerciseRepository;
import de.tum.in.www1.artemis.security.Role;
import de.tum.in.www1.artemis.service.AuthorizationCheckService;
import de.tum.in.www1.artemis.service.SubmissionPolicyService;
import de.tum.in.www1.artemis.web.rest.util.HeaderUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(SubmissionPolicyResource.Endpoints.ROOT)
public class SubmissionPolicyResource {

    private final Logger log = LoggerFactory.getLogger(SubmissionPolicyResource.class);

    public static final String ENTITY_NAME = "programmingExercise.submissionPolicy";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ProgrammingExerciseRepository programmingExerciseRepository;

    private final AuthorizationCheckService authorizationCheckService;

    private final SubmissionPolicyService submissionPolicyService;

    public SubmissionPolicyResource(ProgrammingExerciseRepository programmingExerciseRepository,
                                    AuthorizationCheckService authorizationCheckService, SubmissionPolicyService submissionPolicyService) {
        this.programmingExerciseRepository = programmingExerciseRepository;
        this.authorizationCheckService = authorizationCheckService;
        this.submissionPolicyService = submissionPolicyService;
    }

    /**
     * GET /programming-exercises/:exerciseId/submission-policy : Gets the submission policy of a programming exercise
     *
     * @param exerciseId of the programming exercise for which the submission policy should be fetched
     * @return the ResponseEntity with status 200 (OK) and the submission policy in body. Status 404 when
     *         the programming exercise does not exist and status 403 when the requester is not at least a student
     *         in the course the programming exercise belongs to.
     */
    @GetMapping(Endpoints.PROGRAMMING_EXERCISE_SUBMISSION_POLICY)
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<SubmissionPolicy> getSubmissionPolicyOfExercise(@PathVariable Long exerciseId) {
        log.debug("REST request to get submission policy of programming exercise {}", exerciseId);

        ProgrammingExercise programmingExercise = programmingExerciseRepository.findByIdWithSubmissionPolicyElseThrow(exerciseId);
        authorizationCheckService.checkHasAtLeastRoleForExerciseElseThrow(Role.STUDENT, programmingExercise, null);

        return ResponseEntity.ok().body(programmingExercise.getSubmissionPolicy());
    }

    /*
     * Tests: 1. Auth Check (Student, Tutor, Editor) 2. Programming Exercise does not exist 3. Programming Exercise already has submission policy 4. Submission Policy already has
     * an id 5. LRP: Null submission limit 6. LRP: Negative submission limit / 0 submission limit 7. SPP: Null submission limit 8. SPP: Negative submission limit / 0 submission
     * limit 9. SPP: Null penalty 10. SPP: Negative penalty / 0 penalty
     */
    /**
     * POST /programming-exercises/:exerciseId/submission-policy
     * <br><br>
     * Adds a submission policy to the programming exercise. When a submission policy is added to a programming
     * exercise retroactively, it is disabled by default. More information on adding submission policies
     * can be found at {@link SubmissionPolicyService#addSubmissionPolicyToProgrammingExercise(SubmissionPolicy, ProgrammingExercise)}.
     *
     * @param exerciseId of the programming exercise for which the submission policy in request body should be added
     * @param submissionPolicy that should be added to the programming exercise
     * @return the ResponseEntity with status 200 (OK) and the added submission policy in body. Status 404 when
     *         the programming exercise does not exist, status 403 when the requester is not at least an editor
     *         in the course the programming exercise belongs to and 400 when the submission policy has an id or
     *         is invalid. More information on submission policy validation can be found at {@link SubmissionPolicyService#validateSubmissionPolicy(SubmissionPolicy)}.
     */
    @PostMapping(Endpoints.PROGRAMMING_EXERCISE_SUBMISSION_POLICY)
    @PreAuthorize("hasRole('EDITOR')")
    public ResponseEntity<SubmissionPolicy> addSubmissionPolicyToProgrammingExercise(@PathVariable Long exerciseId, @RequestBody SubmissionPolicy submissionPolicy) {
        log.debug("REST request to add submission policy to programming exercise {}", exerciseId);
        HttpHeaders responseHeaders = HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, submissionPolicy.getId() + "");

        SubmissionPolicy addedSubmissionPolicy;
        ProgrammingExercise programmingExercise = programmingExerciseRepository.findByIdWithSubmissionPolicyElseThrow(exerciseId);
        authorizationCheckService.checkHasAtLeastRoleForExerciseElseThrow(Role.EDITOR, programmingExercise, null);

        if (programmingExercise.getSubmissionPolicy() != null) {
            responseHeaders = HeaderUtil.createFailureAlert(applicationName, true, ENTITY_NAME, "programmingExercisePolicyPresent",
                    "The submission policy could not be added to the programming exercise, because it already has a submission policy.");
            return ResponseEntity.badRequest().headers(responseHeaders).build();
        }

        if (submissionPolicy.getId() != null) {
            responseHeaders = HeaderUtil.createFailureAlert(applicationName, true, ENTITY_NAME, "submissionPolicyHasId",
                    "The submission policy could not be added to the programming exercise, because it already has an id.");
            return ResponseEntity.badRequest().headers(responseHeaders).build();
        }
        submissionPolicyService.validateSubmissionPolicy(submissionPolicy);

        addedSubmissionPolicy = submissionPolicyService.addSubmissionPolicyToProgrammingExercise(submissionPolicy, programmingExercise);
        return ResponseEntity.ok().headers(responseHeaders).body(addedSubmissionPolicy);
    }

    /**
     * DELETE /programming-exercises/:exerciseId/submission-policy
     * <br><br>
     * Removes the submission policy of a programming exercise. When a submission policy is removed from a programming
     * exercise, the submission policy effect is removed from every participation. More information on removing submission policies
     * can be found at {@link SubmissionPolicyService#removeSubmissionPolicyFromProgrammingExercise(ProgrammingExercise)}.
     *
     * @param exerciseId of the programming exercise for which the submission policy should be deleted
     * @return the ResponseEntity with status 200 (OK) when the submission policy was removed successfully. Status 404 when
     *         the programming exercise does not exist, status 403 when the requester is not at least an instructor
     *         in the course the programming exercise belongs to and 400 when the programming exercise does not have a submission policy.
     */
    @DeleteMapping(Endpoints.PROGRAMMING_EXERCISE_SUBMISSION_POLICY)
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> removeSubmissionPolicyFromProgrammingExercise(@PathVariable Long exerciseId) {
        log.debug("REST request to remove submission policy from programming exercise {}", exerciseId);
        HttpHeaders responseHeaders;

        ProgrammingExercise programmingExercise = programmingExerciseRepository.findByIdWithSubmissionPolicyElseThrow(exerciseId);
        authorizationCheckService.checkHasAtLeastRoleForExerciseElseThrow(Role.INSTRUCTOR, programmingExercise, null);

        SubmissionPolicy submissionPolicy = programmingExercise.getSubmissionPolicy();
        if (submissionPolicy == null) {
            responseHeaders = HeaderUtil.createFailureAlert(applicationName, true, ENTITY_NAME, "programmingExercisePolicyNotPresent",
                    "The submission policy could not be removed from the programming exercise, because it does not have a submission policy.");
            return ResponseEntity.badRequest().headers(responseHeaders).build();
        }

        submissionPolicyService.removeSubmissionPolicyFromProgrammingExercise(programmingExercise);
        responseHeaders = HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, submissionPolicy.getId() + "");
        return ResponseEntity.ok().headers(responseHeaders).build();
    }

    /**
     * PUT /programming-exercises/:exerciseId/submission-policy
     * <br><br>
     * Either activates or deactivates the submission policy of a programming exercise, depending on the activate
     * request parameter. Toggling the activation of a submission policy has an immediate effect on student participations.
     * More information can be found at {@link SubmissionPolicyService#enableSubmissionPolicy(SubmissionPolicy)} and
     * {@link SubmissionPolicyService#disableSubmissionPolicy(SubmissionPolicy)}.
     *
     * @param exerciseId of the programming exercise for which the submission policy should be toggled
     * @param activate specifies whether the submission policy should be enabled or disabled
     * @return the ResponseEntity with status 200 (OK) when the submission policy was enabled or disabled. Status 404 when
     *         the programming exercise does not exist, status 403 when the requester is not at least an instructor
     *         in the course the programming exercise belongs to and 400 when activate matches the current status of
     *         the submission policy or the programming exercise has no submission policy.
     */
    @PutMapping(Endpoints.PROGRAMMING_EXERCISE_SUBMISSION_POLICY)
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> toggleSubmissionPolicy(@PathVariable Long exerciseId, @RequestParam Boolean activate) {
        log.debug("REST request to toggle the submission policy for programming exercise {}", exerciseId);
        HttpHeaders responseHeaders;

        ProgrammingExercise exercise = programmingExerciseRepository.findByIdWithSubmissionPolicyElseThrow(exerciseId);
        authorizationCheckService.checkHasAtLeastRoleForExerciseElseThrow(Role.INSTRUCTOR, exercise, null);

        SubmissionPolicy submissionPolicy = exercise.getSubmissionPolicy();
        if (submissionPolicy == null) {
            responseHeaders = HeaderUtil.createFailureAlert(applicationName, true, ENTITY_NAME, "submissionPolicyToggleFailedPolicyNotExist",
                "The submission policy could not be toggled, because the programming exercise does not have a submission policy.");
            return ResponseEntity.badRequest().headers(responseHeaders).build();
        }
        if (activate == submissionPolicy.isActive()) {
            String errorKey = activate ? "submissionPolicyAlreadyEnabled" : "submissionPolicyAlreadyDisabled";
            String defaultMessage = activate ? "The submission policy could not be enabled, because it is already active." :
                "The submission policy could not be disabled, because it is not active.";
            responseHeaders = HeaderUtil.createFailureAlert(applicationName, true, ENTITY_NAME, errorKey,
                    defaultMessage);
            return ResponseEntity.badRequest().headers(responseHeaders).build();
        }
        if (activate) {
            submissionPolicyService.enableSubmissionPolicy(submissionPolicy);
        } else {
            submissionPolicyService.disableSubmissionPolicy(submissionPolicy);
        }
        responseHeaders = HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, exerciseId + "");
        return ResponseEntity.ok().headers(responseHeaders).build();
    }

    /**
     * PATCH /programming-exercises/:exerciseId/submission-policy
     * <br><br>
     * Updates the submission policy of a programming exercise. When a submission policy is updated, the system applies
     * the effect of the submission policy immediately. More information on updating submission policies can be found at
     * {@link SubmissionPolicyService#updateSubmissionPolicy(ProgrammingExercise, SubmissionPolicy)}.
     *
     * @param exerciseId of the programming exercise for which the submission policy in request body should be added
     * @param updatedSubmissionPolicy that should replace the old submission policy
     * @return the ResponseEntity with status 200 (OK) and the updated submission policy in body. Status 404 when
     *         the programming exercise does not exist, status 403 when the requester is not at least an editor
     *         in the course the programming exercise belongs to and 400 when the submission policy has a different type
     *         than the previous submission policy or is invalid. More information on submission policy validation can be
     *         found at {@link SubmissionPolicyService#validateSubmissionPolicy(SubmissionPolicy)}.
     */
    @PatchMapping(Endpoints.PROGRAMMING_EXERCISE_SUBMISSION_POLICY)
    @PreAuthorize("hasRole('EDITOR')")
    public ResponseEntity<SubmissionPolicy> updateSubmissionPolicy(@PathVariable Long exerciseId, @RequestBody SubmissionPolicy updatedSubmissionPolicy) {
        log.debug("REST request to update the submission policy of programming exercise {}", exerciseId);
        HttpHeaders responseHeaders;

        ProgrammingExercise exercise = programmingExerciseRepository.findByIdWithSubmissionPolicyElseThrow(exerciseId);
        authorizationCheckService.checkHasAtLeastRoleForExerciseElseThrow(Role.EDITOR, exercise, null);

        SubmissionPolicy submissionPolicy = exercise.getSubmissionPolicy();
        if (!submissionPolicy.getClass().getTypeName().equals(updatedSubmissionPolicy.getClass().getTypeName())) {
            responseHeaders = HeaderUtil.createFailureAlert(applicationName, true, ENTITY_NAME, "updatedSubmissionPolicyIncorrectType",
                    "The submission policy could not be updated, because the new type is different from the old type.");
            return ResponseEntity.badRequest().headers(responseHeaders).build();
        }

        submissionPolicyService.validateSubmissionPolicy(updatedSubmissionPolicy);

        submissionPolicy = submissionPolicyService.updateSubmissionPolicy(exercise, updatedSubmissionPolicy);

        responseHeaders = HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, exerciseId + "");
        return ResponseEntity.ok().headers(responseHeaders).body(submissionPolicy);
    }

    public static final class Endpoints {

        public static final String ROOT = "/api";

        public static final String PROGRAMMING_EXERCISE_SUBMISSION_POLICY = "/programming-exercises/{exerciseId}/submission-policy";

    }
}
