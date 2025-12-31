import { Controller } from "@hotwired/stimulus"

/**
 * A generic dialog controller for modal overlays.
 * Uses the native <dialog> element for proper viewport coverage and accessibility.
 */
export default class extends Controller {
    static targets = ["modal"]
    static values = {
        closeOnBackdrop: { type: Boolean, default: true }
    }

    connect() {
        if (this.closeOnBackdropValue) {
            this.modalTarget.addEventListener("click", this.handleBackdropClick.bind(this))
        }
        // Ensure ESC key works and syncs with our logic if needed
        this.modalTarget.addEventListener("cancel", (event) => {
            if (!this.closeOnBackdropValue) event.preventDefault()
            else this.close()
        })
    }

    disconnect() {
        this.modalTarget.removeEventListener("click", this.handleBackdropClick.bind(this))
        this.unlockScroll()
    }

    open() {
        this.modalTarget.showModal()
        this.lockScroll()
    }

    close() {
        this.modalTarget.close()
        this.unlockScroll()
        // Emit an event if needed
        this.dispatch("closed")
    }

    toggle() {
        if (this.modalTarget.open) {
            this.close()
        } else {
            this.open()
        }
    }

    lockScroll() {
        document.body.style.overflow = "hidden"
        document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`
    }

    unlockScroll() {
        document.body.style.overflow = ""
        document.body.style.paddingRight = ""
    }

    handleBackdropClick(event) {
        // Native dialogs: clicked area outside the <dialog> box counts as clicking the dialog element
        const rect = this.modalTarget.getBoundingClientRect()
        const isInDialog = (
            rect.top <= event.clientY &&
            event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX &&
            event.clientX <= rect.left + rect.width
        )

        if (!isInDialog) {
            this.close()
        }
    }
}
