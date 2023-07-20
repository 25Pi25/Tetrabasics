import { Board } from './Board';

export function setPaused(this: Board, paused: boolean) {
    const isPaused = this.paused;
    this.paused = paused;

    if (isPaused && !paused) {
        addEventListener("keydown", this.handleKeyDown.bind(this));
        addEventListener("keyup", this.handleKeyUp.bind(this));
    } else if (paused) {
        removeEventListener("keydown", this.handleKeyDown.bind(this));
        removeEventListener("keyup", this.handleKeyUp.bind(this));
        this.keyPresses = new Set<string>();
    }
}
export function handleKeyDown(this: Board, { key }: KeyboardEvent) {
    if (this.keyPresses.has(key)) return;
    this.keyPresses.add(key);

    const ARR = 0;
    const DAS = 100;
    const SDF = -1;
    const activeMino = this.activeTetramino.current;
    const { controlEvents, controlEvents: { left, right } } = this;
    if (!activeMino) return;
    switch (key) {
        case "a":
            if (left.das) return;
            this.clearShiftRepeat(left);
            this.clearShiftRepeat(right);
            activeMino.moveLeft();
            left.das = setTimeout(() => {
                activeMino.moveLeft();
                left.delay = setInterval(() => !this.paused && activeMino.moveLeft(), ARR);
            }, DAS);
            break;
        case "d":
            if (right.das) return;
            this.clearShiftRepeat(left);
            this.clearShiftRepeat(right);
            activeMino.moveRight();
            right.das = setTimeout(() => {
                activeMino.moveRight();
                right.delay = setInterval(() => !this.paused && activeMino.moveRight(), ARR);
            }, DAS);
            break;
        case "s":
            if (controlEvents.down) return;
            activeMino.moveDown();
            if (SDF != -1) controlEvents.down = setInterval(() => !this.paused && activeMino.moveDown(), 500 / SDF);
            else controlEvents.down = setInterval(() => !this.paused && activeMino.hardDrop(false), 0);
            break;
        case "w":
            this.activeTetramino.current?.hardDrop();
            break;
        case "3":
            this.activeTetramino.current?.rotateRight();
            break;
        case "2":
            this.activeTetramino.current?.rotateLeft();
            break;
        case "5":
            this.activeTetramino.current?.rotate180();
            break;
        case "6":
            this.activeTetramino.current?.hold();
            break;
    }
}
export function handleKeyUp(this: Board, { key }: KeyboardEvent) {
    this.keyPresses.delete(key);
    const { controlEvents, controlEvents: { left, right } } = this;
    if (key == 'a') this.clearShiftRepeat(left);
    if (key == 'd') this.clearShiftRepeat(right);
    if (key == 's') {
        if (controlEvents.down) clearInterval(controlEvents.down);
        controlEvents.down = null;
    }
}
export const controlEvents: {
    left: { das: ReturnType<typeof setTimeout> | null, delay: ReturnType<typeof setInterval> | null },
    right: { das: ReturnType<typeof setTimeout> | null, delay: ReturnType<typeof setInterval> | null },
    down: ReturnType<typeof setInterval> | null
} = { left: { das: null, delay: null }, right: { das: null, delay: null }, down: null }
export function clearShiftRepeat(this: Board, eventDirection: { das: ReturnType<typeof setTimeout> | null, delay: ReturnType<typeof setInterval> | null }) {
    if (eventDirection.das) {
        clearTimeout(eventDirection.das);
        eventDirection.das = null;
    }
    if (eventDirection.delay) {
        clearTimeout(eventDirection.delay);
        eventDirection.delay = null;
    }
}

