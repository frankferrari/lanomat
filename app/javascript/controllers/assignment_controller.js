import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static targets = ["item", "input"]
    static values = {
        activeClass: String,
        inactiveClass: String
    }

    connect() {
        this.sync()
    }

    toggle(event) {
        event.preventDefault()
        const value = event.currentTarget.dataset.value
        // Use loose equality to handle string/number differences
        const input = this.inputTargets.find(i => i.value == value)

        if (input) {
            input.checked = !input.checked
            input.dispatchEvent(new Event("change", { bubbles: true }))
            this.sync()
        }
    }

    sync() {
        const activeClasses = this.activeClassValue.split(" ").filter(c => c.length > 0)
        const inactiveClasses = this.inactiveClassValue.split(" ").filter(c => c.length > 0)

        this.itemTargets.forEach(item => {
            const value = item.dataset.value
            // Use loose equality to handle string/number differences
            const input = this.inputTargets.find(i => i.value == value)

            if (input && input.checked) {
                item.classList.remove(...inactiveClasses)
                item.classList.add(...activeClasses)
            } else {
                item.classList.remove(...activeClasses)
                item.classList.add(...inactiveClasses)
            }
        })
    }
}
