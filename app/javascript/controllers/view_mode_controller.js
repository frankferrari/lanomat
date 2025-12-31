import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static targets = ["container", "gridBtn", "listBtn"]

    connect() {
        this.viewMode = localStorage.getItem("viewMode") || "grid"
        this.applyViewMode()
    }

    setGrid() {
        this.viewMode = "grid"
        this.saveViewMode()
        this.applyViewMode()
    }

    setList() {
        this.viewMode = "list"
        this.saveViewMode()
        this.applyViewMode()
    }

    saveViewMode() {
        localStorage.setItem("viewMode", this.viewMode)
    }

    applyViewMode() {
        this.containerTarget.dataset.view = this.viewMode

        if (this.viewMode === "grid") {
            this.gridBtnTarget.classList.add("bg-purple-600", "text-white")
            this.gridBtnTarget.classList.remove("text-slate-400")
            this.listBtnTarget.classList.remove("bg-purple-600", "text-white")
            this.listBtnTarget.classList.add("text-slate-400")
        } else {
            this.listBtnTarget.classList.add("bg-purple-600", "text-white")
            this.listBtnTarget.classList.remove("text-slate-400")
            this.gridBtnTarget.classList.remove("bg-purple-600", "text-white")
            this.gridBtnTarget.classList.add("text-slate-400")
        }
    }
}
