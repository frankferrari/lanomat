import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static targets = ["input", "suggestions", "selectedContainer", "template", "hiddenInputContainer"]
    static values = {
        available: Array,
        existing: Array
    }

    connect() {
        this.selectedTags = new Set(this.existingValue)
        this.renderSelected()

        // Close suggestions when clicking outside
        document.addEventListener("click", this.handleClickOutside.bind(this))
    }

    disconnect() {
        document.removeEventListener("click", this.handleClickOutside.bind(this))
    }

    // --- Actions ---

    // Called when input retrieves focus or is clicked
    open() {
        this.filterSuggestions(this.inputTarget.value)
        this.showSuggestions()
    }

    input(event) {
        this.filterSuggestions(this.inputTarget.value)
        this.showSuggestions()
    }

    keydown(event) {
        if (event.key === "Enter") {
            event.preventDefault()
            this.addTag(this.inputTarget.value)
        } else if (event.key === "Backspace" && this.inputTarget.value === "" && this.selectedTags.size > 0) {
            // Remove last tag on backspace if input is empty
            const lastTag = Array.from(this.selectedTags).pop()
            this.removeTagByName(lastTag)
        } else if (event.key === "ArrowDown") {
            // Allow navigation into suggestions (v2 enhancement)
            // For now, simple interaction
        }
    }

    select(event) {
        // Stop propagation so handleClickOutside doesn't see this as an "outside" click
        // (since the element might be removed from DOM by renderSelected/filterSuggestions)
        event.stopPropagation()
        const tagName = event.currentTarget.dataset.value
        this.addTag(tagName)
        this.inputTarget.focus()
    }

    remove(event) {
        const tagName = event.currentTarget.dataset.value
        this.removeTagByName(tagName)
    }

    // --- Logic ---

    addTag(name) {
        const cleanName = name.trim()
        if (cleanName && !this.selectedTags.has(cleanName)) {
            this.selectedTags.add(cleanName)
            this.renderSelected()
            this.inputTarget.value = ""
            this.filterSuggestions()
            this.dispatchChange()
        } else if (this.selectedTags.has(cleanName)) {
            // Tag already selected, just clear input
            this.inputTarget.value = ""
            this.filterSuggestions()
        }
    }

    removeTagByName(name) {
        if (this.selectedTags.delete(name)) {
            this.renderSelected()
            this.filterSuggestions() // Re-show in list if applicable
            this.dispatchChange()
        }
    }

    filterSuggestions(query = "") {
        const lowerQuery = query.toLowerCase()

        // Filter available tags: match query AND not already selected
        const matches = this.availableValue.filter(tag => {
            const isSelected = this.selectedTags.has(tag)
            const matchesQuery = tag.toLowerCase().includes(lowerQuery)
            return !isSelected && matchesQuery
        })

        // Render suggestions
        this.suggestionsTarget.innerHTML = matches.map(tag => `
      <div class="px-3 py-2 cursor-pointer hover:bg-slate-800 text-slate-300 transition-colors"
           data-action="click->combobox#select"
           data-value="${tag}">
        ${tag}
      </div>
    `).join("")

        // If query exists but no matches, maybe show "Create: [query]"?
        // For now, just showing available matches is enough.
        // Tapping generic 'Enter' handles creation.

        this.toggleSuggestionsVisibility(matches.length > 0 || query.length > 0)
    }

    renderSelected() {
        // 1. Render visible chips
        this.selectedContainerTarget.innerHTML = Array.from(this.selectedTags).map(tag => `
      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
        ${tag}
        <button type="button" data-action="click->combobox#remove" data-value="${tag}" class="hover:text-white transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </span>
    `).join("")

        // 2. Render hidden inputs for form submission
        this.hiddenInputContainerTarget.innerHTML = Array.from(this.selectedTags).map(tag => `
        <input type="hidden" name="game[tag_names][]" value="${tag}">
    `).join("")
    }

    // --- UI Helpers ---

    showSuggestions() {
        this.suggestionsTarget.classList.remove("hidden")
    }

    hideSuggestions() {
        this.suggestionsTarget.classList.add("hidden")
    }

    toggleSuggestionsVisibility(shouldShow) {
        if (shouldShow) {
            this.showSuggestions()
        } else {
            this.hideSuggestions()
        }
    }

    handleClickOutside(event) {
        if (!this.element.contains(event.target)) {
            this.hideSuggestions()
        }
    }

    dispatchChange() {
        // Dispatch a custom change event so auto-submit can pick it up
        this.element.dispatchEvent(new Event("change", { bubbles: true }))
    }
}
