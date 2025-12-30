import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="wheel"
export default class extends Controller {
  static targets = [
    "canvas",
    "winnerDisplay",
    "winnerName",
    "winnerMeta",
    "spinButton",
    "playIcon",
    "spinIcon",
    "container",
    "dataSource"
  ]
  static values = {
    colors: { type: Array, default: ['#7c3aed', '#db2777', '#2563eb', '#059669', '#d97706', '#dc2626', '#4f46e5', '#0891b2'] }
  }

  connect() {
    this.rotation = 0
    this.spinning = false
    this.currentFilter = 'top5'

    // Initial data load
    this.updateData()

    // Observe for Turbo Stream updates replacing the data source
    this.observer = new MutationObserver((mutations) => {
      // When turbo replaces the element, it might be a childList mutation on the parent, 
      // or if we target the element itself, the controller might disconnect/reconnect 
      // depending on where the controller is.
      // Here, the controller is on the parent wrapper. The dataSource is a child.
      // Turbo Stream replace "wheel_data_source" will replace the child.
      // This triggers a childList mutation.
      this.updateData()
    })

    this.observer.observe(this.element, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-games'] })

    this.draw()

    // Bind the resize event to redraw the wheel
    this.resizeObserver = new ResizeObserver(() => this.draw())
    this.resizeObserver.observe(this.canvasTarget)
  }

  disconnect() {
    if (this.resizeObserver) this.resizeObserver.disconnect()
    if (this.observer) this.observer.disconnect()
  }

  updateData() {
    // If we are spinning, DO NOT update the wheel data to prevent visual glitches or changing the winner mid-spin
    if (this.spinning) return

    if (this.hasDataSourceTarget) {
      try {
        this.gamesValue = JSON.parse(this.dataSourceTarget.dataset.games)
        this.draw()
      } catch (e) {
        console.error("Failed to parse games data", e)
      }
    }
  }

  get filteredGames() {
    // Allow fallback if gamesValue is undefined initially
    const games = this.gamesValue || []

    if (this.currentFilter === 'top5') {
      const top5 = [...this.gamesValue]
        .filter(g => g.votes > 0)
        .sort((a, b) => b.votes - a.votes)
        .slice(0, 5)

      return top5.length > 0 ? top5 : this.gamesValue
    }
    return this.gamesValue
  }

  filter(event) {
    if (this.spinning) return

    this.currentFilter = event.currentTarget.dataset.filter

    // Toggle active classes on filter buttons
    this.element.querySelectorAll('[data-action="wheel#filter"]').forEach(btn => {
      const isActive = btn.dataset.filter === this.currentFilter
      btn.classList.toggle('bg-purple-600', isActive)
      btn.classList.toggle('text-white', isActive)
      btn.classList.toggle('text-slate-500', !isActive)
    })

    this.draw()
    this.winnerDisplayTarget.classList.add('hidden')
  }

  draw() {
    const canvas = this.canvasTarget
    const games = this.filteredGames
    if (!canvas || games.length === 0) return

    const ctx = canvas.getContext('2d')
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    // Set internal canvas resolution to match display size * pixel ratio for sharpness
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 10

    ctx.clearRect(0, 0, width, height)
    const sliceAngle = (Math.PI * 2) / games.length

    games.forEach((game, i) => {
      const angle = i * sliceAngle + this.rotation

      // Draw slice
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, angle, angle + sliceAngle)
      ctx.fillStyle = this.colorsValue[i % this.colorsValue.length]
      ctx.fill()
      ctx.strokeStyle = '#020617'
      ctx.lineWidth = 4
      ctx.stroke()

      // Draw text
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(angle + sliceAngle / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = 'white'
      ctx.font = '900 14px Inter, sans-serif'

      const displayName = game.name.length > 20 ? game.name.substring(0, 17) + '...' : game.name
      ctx.fillText(displayName.toUpperCase(), radius - 40, 5)
      ctx.restore()
    })

    // Hub (Center Circle)
    ctx.beginPath()
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2)
    ctx.fillStyle = '#0f172a'
    ctx.fill()
    ctx.strokeStyle = '#7c3aed'
    ctx.lineWidth = 4
    ctx.stroke()
  }

  spin() {
    if (this.spinning || this.filteredGames.length === 0) return

    this.spinning = true
    this.winnerDisplayTarget.classList.add('hidden')
    this.spinButtonTarget.disabled = true
    this.playIconTarget.classList.add('hidden')
    this.spinIconTarget.classList.remove('hidden')
    this.containerTarget.classList.add('scale-105')

    const spinDuration = 4000
    // random between 30 and 50 rad/sec
    const spinForce = 30 + Math.random() * 20
    const startTime = performance.now()
    const startRotation = this.rotation

    const animate = (time) => {
      const elapsed = time - startTime
      const progress = Math.min(elapsed / spinDuration, 1)

      // Ease out quartic
      const easeOut = (t) => 1 - Math.pow(1 - t, 4)

      this.rotation = startRotation + (spinForce * easeOut(progress))
      this.draw()

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        this.stopSpinning()
      }
    }
    requestAnimationFrame(animate)
  }

  stopSpinning() {
    this.spinning = false
    this.spinButtonTarget.disabled = false
    this.playIconTarget.classList.remove('hidden')
    this.spinIconTarget.classList.add('hidden')
    this.containerTarget.classList.remove('scale-105')

    this.calculateWinner()
  }

  calculateWinner() {
    const games = this.filteredGames
    const normalizedRotation = this.rotation % (Math.PI * 2)
    const sliceAngle = (Math.PI * 2) / games.length

    // The pointer is at Math.PI * 1.5 (top 12 o'clock)
    // winning index = (pointerOffset - rotation) / sliceAngle
    // We add 200*PI to ensure positive result before modulo
    let winningIndex = Math.floor(((Math.PI * 1.5) - normalizedRotation + (Math.PI * 200)) / sliceAngle) % games.length

    const winner = games[winningIndex]
    this.showWinner(winner)
  }

  showWinner(winner) {
    this.winnerNameTarget.textContent = winner.name
    this.winnerMetaTarget.textContent = `${winner.genre} • ${winner.max_players || '∞'} Players`
    this.winnerDisplayTarget.classList.remove('hidden')
    // Tailwind's animate-in is a custom class usually from a plugin, but let's assume standard fade/zoom or just simple reveal
    this.winnerDisplayTarget.classList.add('animate-in', 'zoom-in', 'duration-300')
  }

  dismissWinner() {
    this.winnerDisplayTarget.classList.add('hidden')
  }
}
