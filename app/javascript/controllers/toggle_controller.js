import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static targets = ["input", "content"]

    connect() {
        this.toggle()
    }

    toggle() {
        if (this.hasInputTarget && this.hasContentTarget) {
            const isChecked = this.inputTarget.checked
            this.contentTarget.classList.toggle("hidden", !isChecked)

            if (!isChecked) {
                this.contentTarget.querySelectorAll("[data-toggle-default]").forEach(element => {
                    element.value = element.dataset.toggleDefault
                })
            }
        }
    }
}
