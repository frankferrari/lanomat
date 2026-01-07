import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static values = {
        current: String,
        locked: Boolean
    }

    connect() {
        // If the view mode is locked (e.g. on mobile), do not attempt to restore from local storage
        if (this.lockedValue) return

        // On page load, check if localStorage has a preferred view mode
        const savedMode = localStorage.getItem("viewMode")
        const allowedModes = ["grid", "list"]

        // If saved mode is valid, differs from current frame state, and is not already in the URL
        if (savedMode && allowedModes.includes(savedMode) && savedMode !== this.currentValue) {
            const url = new URL(window.location)

            // Only trigger a redirect if the URL param actually needs updating
            if (url.searchParams.get("view") !== savedMode) {
                url.searchParams.set("view", savedMode)
                Turbo.visit(url, { action: "replace" })
            }
        }
    }

    save(event) {
        if (this.lockedValue) return

        const mode = event.params.value
        if (mode) {
            localStorage.setItem("viewMode", mode)
        }
    }
}
