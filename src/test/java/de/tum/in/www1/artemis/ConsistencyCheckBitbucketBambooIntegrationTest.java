package de.tum.in.www1.artemis;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;

import de.tum.in.www1.artemis.service.ConsistencyCheckServiceTest;

public class ConsistencyCheckBitbucketBambooIntegrationTest extends AbstractSpringIntegrationBambooBitbucketJiraTest {

    @Autowired
    private ConsistencyCheckServiceTest consistencyCheckServiceTest;

    @BeforeEach
    public void setup() throws Exception {
        consistencyCheckServiceTest.setup(this);
        bambooRequestMockProvider.enableMockingOfRequests();
        bitbucketRequestMockProvider.enableMockingOfRequests();
    }

    @AfterEach
    public void tearDown() throws Exception {
        bitbucketRequestMockProvider.reset();
        bambooRequestMockProvider.reset();
        database.resetDatabase();
    }

    /**
     * Test consistencyCheck feature with programming exercise without
     * inconsistencies
     * @throws Exception if an error occurs
     */
    @Test
    @WithMockUser(username = "instructor1", roles = "INSTRUCTOR")
    public void checkConsistencyOfProgrammingExercise_noErrors() throws Exception {
        consistencyCheckServiceTest.checkConsistencyOfProgrammingExercise_noErrors();
    }

    @Test
    @WithMockUser(username = "instructor1", roles = "INSTRUCTOR")
    public void checkConsistencyOfProgrammingExercise_missingVCSProject() throws Exception {
        consistencyCheckServiceTest.checkConsistencyOfProgrammingExercise_missingVCSProject();
    }

    @Test
    @WithMockUser(username = "instructor1", roles = "INSTRUCTOR")
    public void checkConsistencyOfProgrammingExercise_missingVCSRepos() throws Exception {
        consistencyCheckServiceTest.checkConsistencyOfProgrammingExercise_missingVCSRepos();
    }

    @Test
    @WithMockUser(username = "instructor1", roles = "INSTRUCTOR")
    public void checkConsistencyOfProgrammingExercise_buildPlansMissing() throws Exception {
        consistencyCheckServiceTest.checkConsistencyOfProgrammingExercise_buildPlansMissing();
    }

    @Test
    @WithMockUser(username = "instructor1", roles = "INSTRUCTOR")
    public void checkConsistencyOfProgrammingExercise_isLocalSimulation() throws Exception {
        consistencyCheckServiceTest.checkConsistencyOfProgrammingExercise_isLocalSimulation();
    }

    @Test
    @WithMockUser(username = "instructor1", roles = "INSTRUCTOR")
    public void checkConsistencyOfProgrammingExercise_forbidden() throws Exception {
        consistencyCheckServiceTest.checkConsistencyOfProgrammingExercise_forbidden();
    }

    @Test
    @WithMockUser(username = "instructor1", roles = "INSTRUCTOR")
    public void checkConsistencyOfCourse_forbidden() throws Exception {
        consistencyCheckServiceTest.checkConsistencyOfCourse_forbidden();
    }

    @Test
    @WithMockUser(username = "instructor1", roles = "INSTRUCTOR")
    public void checkConsistencyOfCourse() throws Exception {
        consistencyCheckServiceTest.checkConsistencyOfCourse();
    }
}
