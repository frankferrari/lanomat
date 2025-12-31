import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static values = { current: String }

    connect() {
        // On page load, check if localStorage has a preferred view mode
        const savedMode = localStorage.getItem("viewMode")

        // If saved mode differs from current and we're not already navigating
        if (savedMode && savedMode !== this.currentValue) {
            const url = new URL(window.location)
            url.searchParams.set("view", savedMode)
            Turbo.visit(url, { action: "replace" })
        }
    }

    save(event) {
        const mode = event.params.value
        if (mode) {
            localStorage.setItem("viewMode", mode)
        }
    }
}
