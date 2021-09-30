package de.tum.in.www1.artemis.domain.submissionpolicy;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

import com.fasterxml.jackson.annotation.JsonInclude;

@Entity
@DiscriminatorValue("SPP")
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class SubmissionPenaltyPolicy extends SubmissionPolicy {

    @Column(name = "exceeding_penalty")
    private Double exceedingPenalty;

    public Double getExceedingPenalty() {
        return exceedingPenalty;
    }

    public void setExceedingPenalty(Double exceedingPenalty) {
        this.exceedingPenalty = exceedingPenalty;
    }
}