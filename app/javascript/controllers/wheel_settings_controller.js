import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static targets = ["modeInput", "topCountField", "weightedField"]
    static values = {
        mode: String
    }

    connect() {
        this.updateVisibility()
    }

    modeChanged() {
        this.modeValue = this.modeInputTarget.value
        this.updateVisibility()
    }

    updateVisibility() {
        // Show "How Many Games" only for "top_x" mode
        if (this.hasTopCountFieldTarget) {
            if (this.modeValue === "top_x") {
                this.topCountFieldTarget.classList.remove("hidden")
            } else {
                this.topCountFieldTarget.classList.add("hidden")
            }
        }

        // Hide "Weighted Slices" for "winners" mode (all tied games have same score)
        if (this.hasWeightedFieldTarget) {
            if (this.modeValue === "winners") {
                this.weightedFieldTarget.classList.add("hidden")
            } else {
                this.weightedFieldTarget.classList.remove("hidden")
            }
        }
    }

    modeValueChanged() {
        this.updateVisibility()
    }
}
