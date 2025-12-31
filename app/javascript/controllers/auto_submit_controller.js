import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="auto-submit"
export default class extends Controller {
    static values = {
        delay: { type: Number, default: 0 }
    }

    submit() {
        clearTimeout(this.timeout)
        this.timeout = setTimeout(() => {
            this.element.requestSubmit()
        }, this.delayValue || 500)
    }
}
