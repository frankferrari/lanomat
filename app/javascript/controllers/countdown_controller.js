import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    static values = {
        seconds: Number,
        active: Boolean
    }
    static targets = ["timer", "progress"]

    connect() {
        if (this.activeValue && this.secondsValue > 0) {
            this.startTimer()
        }
    }

    disconnect() {
        this.stopTimer()
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.secondsValue--
            if (this.secondsValue <= 0) {
                this.stopTimer()
                this.dispatch("ended")
            }
        }, 1000)
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer)
        }
    }

    secondsValueChanged() {
        this.updateDisplay()
    }

    updateDisplay() {
        if (!this.hasTimerTarget) return

        const minutes = Math.floor(this.secondsValue / 60)
        const seconds = this.secondsValue % 60

        this.timerTarget.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`

        if (this.secondsValue <= 10 && this.secondsValue > 0) {
            this.timerTarget.classList.add("text-red-500", "animate-pulse")
        } else {
            this.timerTarget.classList.remove("text-red-500", "animate-pulse")
        }
    }
}
