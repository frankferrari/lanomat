import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static values = {
        games: Array,
        proportional: Boolean,
        startAt: String,
        winnerId: Number,
        spinId: String
    }

    static targets = ["canvas", "countdown", "countdownNumber", "winner", "winnerName"]

    // Wheel colors matching the React sample
    colors = ['#7c3aed', '#db2777', '#2563eb', '#059669', '#d97706', '#dc2626', '#4f46e5', '#0891b2']

    connect() {
        this.rotation = 0
        this.spinning = false
        this.showingWinner = false
        
        if (this.hasCanvasTarget && this.gamesValue.length > 0) {
            this.drawWheel()
            this.startCountdownOrSpin()
        }
    }

    disconnect() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame)
        }
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval)
        }
    }

    startCountdownOrSpin() {
        const startAt = new Date(this.startAtValue).getTime()
        const now = Date.now()
        const timeUntilStart = startAt - now

        if (timeUntilStart > 0) {
            // Show countdown
            this.showCountdown(Math.ceil(timeUntilStart / 1000))
            
            this.countdownInterval = setInterval(() => {
                const remaining = Math.ceil((startAt - Date.now()) / 1000)
                if (remaining <= 0) {
                    clearInterval(this.countdownInterval)
                    this.hideCountdown()
                    this.startSpin()
                } else {
                    this.updateCountdown(remaining)
                }
            }, 100)
        } else {
            // Already past start time, begin spin immediately
            this.hideCountdown()
            this.startSpin()
        }
    }

    showCountdown(seconds) {
        if (this.hasCountdownTarget) {
            this.countdownTarget.classList.remove("hidden")
        }
        this.updateCountdown(seconds)
    }

    updateCountdown(seconds) {
        if (this.hasCountdownNumberTarget) {
            this.countdownNumberTarget.textContent = seconds
        }
    }

    hideCountdown() {
        if (this.hasCountdownTarget) {
            this.countdownTarget.classList.add("hidden")
        }
    }

    startSpin() {
        if (this.spinning) return
        this.spinning = true

        const startAt = new Date(this.startAtValue).getTime()
        const spinDuration = 5000 // 5 seconds
        
        // Calculate the final rotation needed to land on winner
        const winnerIndex = this.gamesValue.findIndex(g => g.id === this.winnerIdValue)
        const sliceAngles = this.calculateSliceAngles()
        
        // Calculate angle to center of winner slice
        let angleToWinner = 0
        for (let i = 0; i < winnerIndex; i++) {
            angleToWinner += sliceAngles[i]
        }
        angleToWinner += sliceAngles[winnerIndex] / 2 // Center of the slice
        
        // We need the pointer (at top, which is 3π/2 or -π/2) to point to the winner
        // The wheel rotates clockwise, so we calculate how much rotation is needed
        // Start with multiple full spins plus the exact angle to winner
        const fullSpins = 5 + Math.random() * 3 // 5-8 full rotations
        const targetAngle = (fullSpins * Math.PI * 2) + (Math.PI * 1.5) - angleToWinner
        
        this.spinForce = targetAngle
        this.startRotation = this.rotation
        this.spinStartTime = startAt

        this.animate()
    }

    animate() {
        const now = Date.now()
        const elapsed = now - this.spinStartTime
        const spinDuration = 5000

        if (elapsed < spinDuration) {
            const progress = elapsed / spinDuration
            // Ease-out function: 1 - (1 - t)^4
            const easeOut = 1 - Math.pow(1 - progress, 4)
            this.rotation = this.startRotation + (this.spinForce * easeOut)
            this.drawWheel()
            this.animationFrame = requestAnimationFrame(() => this.animate())
        } else {
            // Animation complete
            this.rotation = this.startRotation + this.spinForce
            this.drawWheel()
            this.spinning = false
            this.showWinner()
        }
    }

    calculateSliceAngles() {
        const games = this.gamesValue
        const totalAngle = Math.PI * 2

        if (this.proportionalValue) {
            // Proportional slices based on votes
            const totalVotes = games.reduce((sum, g) => sum + Math.max(1, g.votes), 0)
            return games.map(g => (Math.max(1, g.votes) / totalVotes) * totalAngle)
        } else {
            // Equal slices
            const sliceAngle = totalAngle / games.length
            return games.map(() => sliceAngle)
        }
    }

    drawWheel() {
        const canvas = this.canvasTarget
        const ctx = canvas.getContext("2d")
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const radius = canvas.width / 2 - 10

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        const games = this.gamesValue
        const sliceAngles = this.calculateSliceAngles()
        let currentAngle = this.rotation

        games.forEach((game, i) => {
            const sliceAngle = sliceAngles[i]
            
            // Draw slice
            ctx.beginPath()
            ctx.moveTo(centerX, centerY)
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
            ctx.fillStyle = this.colors[i % this.colors.length]
            ctx.fill()
            ctx.strokeStyle = "#020617"
            ctx.lineWidth = 4
            ctx.stroke()

            // Draw text
            ctx.save()
            ctx.translate(centerX, centerY)
            ctx.rotate(currentAngle + sliceAngle / 2)
            ctx.textAlign = "right"
            ctx.fillStyle = "white"
            ctx.font = "bold 12px Inter, system-ui, sans-serif"
            const displayName = game.name.length > 15 ? game.name.substring(0, 12) + "..." : game.name
            ctx.fillText(displayName.toUpperCase(), radius - 40, 5)
            ctx.restore()

            currentAngle += sliceAngle
        })

        // Draw center hub
        ctx.beginPath()
        ctx.arc(centerX, centerY, 30, 0, Math.PI * 2)
        ctx.fillStyle = "#0f172a"
        ctx.fill()
        ctx.strokeStyle = "#7c3aed"
        ctx.lineWidth = 4
        ctx.stroke()
    }

    showWinner() {
        if (this.showingWinner) return
        this.showingWinner = true

        const winner = this.gamesValue.find(g => g.id === this.winnerIdValue)
        if (winner && this.hasWinnerTarget) {
            if (this.hasWinnerNameTarget) {
                this.winnerNameTarget.textContent = winner.name
            }
            this.winnerTarget.classList.remove("hidden")
            this.winnerTarget.classList.add("animate-in", "zoom-in", "duration-300")
        }
    }

    dismiss() {
        // Called when dismiss button is clicked - form submission handles the actual dismiss
    }
}
