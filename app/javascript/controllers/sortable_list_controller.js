import { Controller } from "@hotwired/stimulus"

/**
 * Sortable List Controller
 * 
 * Automatically sorts child elements based on data attributes whenever
 * the DOM is updated (e.g., via Turbo Streams). Uses MutationObserver
 * to detect changes and re-sorts smoothly with FLIP animations.
 * Also dynamically manages leader badge creation/removal.
 */
export default class extends Controller {
  static targets = ["item"]
  static values = {
    animationDuration: { type: Number, default: 300 }
  }

  // Badge HTML templates for grid and list views
  static gridBadgeHTML = `
    <div data-leader-badge class="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-slate-950 text-xs font-black uppercase px-3 py-0.5 rounded-full flex items-center gap-1 shadow-lg z-10 animate-fade-in">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
      <span>Leading</span>
    </div>
  `

  static listBadgeHTML = `
    <span data-leader-badge class="inline-flex bg-yellow-500 text-slate-950 p-0.5 rounded-full animate-fade-in" title="Leading">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    </span>
  `

  connect() {
    this.sort(false) // Initial sort without animation
    this.observeMutations()
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }

  observeMutations() {
    this.observer = new MutationObserver((mutations) => {
      const hasRelevantChanges = mutations.some(mutation => {
        if (mutation.type === "childList") return true
        if (mutation.type === "attributes" &&
          (mutation.attributeName === "data-score" ||
            mutation.attributeName === "data-name")) {
          return true
        }
        return false
      })

      if (hasRelevantChanges) {
        clearTimeout(this.sortTimeout)
        this.sortTimeout = setTimeout(() => this.sort(true), 50)
      }
    })

    this.observer.observe(this.element, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-score", "data-name"]
    })
  }

  sort(animate = true) {
    const items = this.itemTargets
    if (items.length === 0) return

    const positions = animate ? this.capturePositions(items) : null

    const sorted = [...items].sort((a, b) => {
      const scoreA = parseInt(a.dataset.score) || 0
      const scoreB = parseInt(b.dataset.score) || 0

      if (scoreB !== scoreA) {
        return scoreB - scoreA
      }

      const nameA = (a.dataset.name || "").toLowerCase()
      const nameB = (b.dataset.name || "").toLowerCase()
      return nameA.localeCompare(nameB)
    })

    const orderChanged = sorted.some((item, index) => item !== items[index])
    if (!orderChanged) {
      // Even if order hasn't changed, still update leader badges
      // (score might have changed affecting who's leader)
      this.updateLeaderBadges(sorted)
      return
    }

    this.observer?.disconnect()

    sorted.forEach(item => this.element.appendChild(item))

    if (animate && positions) {
      this.animatePositions(sorted, positions)
    }

    this.updateLeaderBadges(sorted)
    this.observeMutations()
  }

  capturePositions(items) {
    const positions = new Map()
    items.forEach(item => {
      const rect = item.getBoundingClientRect()
      positions.set(item, { x: rect.left, y: rect.top })
    })
    return positions
  }

  animatePositions(items, oldPositions) {
    items.forEach(item => {
      const oldPos = oldPositions.get(item)
      if (!oldPos) return

      const newRect = item.getBoundingClientRect()
      const deltaX = oldPos.x - newRect.left
      const deltaY = oldPos.y - newRect.top

      if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) return

      item.style.transform = `translate(${deltaX}px, ${deltaY}px)`
      item.style.transition = "none"
      item.offsetHeight
      item.style.transition = `transform ${this.animationDurationValue}ms ease-out`
      item.style.transform = ""

      item.addEventListener("transitionend", () => {
        item.style.transition = ""
        item.style.transform = ""
      }, { once: true })
    })
  }

  updateLeaderBadges(sortedItems) {
    // Find the highest score
    const highestScore = sortedItems.length > 0
      ? parseInt(sortedItems[0].dataset.score) || 0
      : 0

    sortedItems.forEach((item) => {
      const score = parseInt(item.dataset.score) || 0
      // Leader if tied for highest score AND score > 0
      const isLeader = score > 0 && score === highestScore

      // Update data attribute (used by CSS for border styling)
      item.dataset.leader = isLeader ? "true" : "false"

      // Handle badge creation/removal
      const existingBadge = item.querySelector("[data-leader-badge]")

      if (isLeader && !existingBadge) {
        // Create badge - determine if grid or list based on ID
        const isGrid = item.id.startsWith("grid_")
        const badgeHTML = isGrid ? this.constructor.gridBadgeHTML : this.constructor.listBadgeHTML

        if (isGrid) {
          // Grid: insert at start of card
          item.insertAdjacentHTML("afterbegin", badgeHTML)
        } else {
          // List: insert after the game name in the h3
          const h3 = item.querySelector("h3")
          if (h3) {
            h3.insertAdjacentHTML("beforeend", badgeHTML)
          }
        }
      } else if (!isLeader && existingBadge) {
        // Remove badge with fade out
        existingBadge.style.opacity = "0"
        existingBadge.style.transition = "opacity 200ms ease-out"
        setTimeout(() => existingBadge.remove(), 200)
      }
    })
  }
}
