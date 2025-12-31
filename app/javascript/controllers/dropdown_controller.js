import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static targets = ["menu", "button", "hiddenInput", "selectedText"]
    static values = {
        open: { type: Boolean, default: false }
    }

    connect() {
        this.close()
        this.handleClickOutside = this.handleClickOutside.bind(this)
        document.addEventListener("click", this.handleClickOutside)
    }

    disconnect() {
        document.removeEventListener("click", this.handleClickOutside)
    }

    toggle() {
        this.openValue ? this.close() : this.open()
    }

    open() {
        this.openValue = true
        this.menuTarget.classList.remove("hidden")
        // Trigger animation next tick
        requestAnimationFrame(() => {
            this.menuTarget.classList.remove("opacity-0", "scale-95")
            this.menuTarget.classList.add("opacity-100", "scale-100")
        })
    }

    close() {
        this.openValue = false
        this.menuTarget.classList.add("opacity-0", "scale-95")
        this.menuTarget.classList.remove("opacity-100", "scale-100")

        // Hide after animation
        setTimeout(() => {
            if (!this.openValue) {
                this.menuTarget.classList.add("hidden")
            }
        }, 100)
    }

    select(event) {
        const value = event.currentTarget.dataset.value
        const text = event.currentTarget.dataset.text

        this.hiddenInputTarget.value = value
        this.selectedTextTarget.textContent = text

        // Update selected state in UI
        this.menuTarget.querySelectorAll("[data-value]").forEach(el => {
            el.classList.remove("bg-purple-600/20", "text-purple-400")
            el.classList.add("text-slate-400")
        })
        event.currentTarget.classList.add("bg-purple-600/20", "text-purple-400")
        event.currentTarget.classList.remove("text-slate-400")

        this.close()

        // Dispatch change event for auto-submit
        this.hiddenInputTarget.dispatchEvent(new Event("change", { bubbles: true }))
    }

    handleClickOutside(event) {
        if (!this.element.contains(event.target) && this.openValue) {
            this.close()
        }
    }
}
