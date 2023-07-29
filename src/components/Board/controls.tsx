import Config from '../../config';
import { Board } from './Board';

export function setPaused(this: Board, paused: boolean) {
    const isPaused = this.paused;
    this.paused = paused;

    if (isPaused && !paused) {
        this.keyPresses = new Set<string>();
        document.addEventListener("keydown", this.handleKeyDown);
        document.addEventListener("keyup", this.handleKeyUp);
    } else if (paused) {
        this.keyPresses = new Set<string>();
        document.removeEventListener("keydown", this.handleKeyDown);
        document.removeEventListener("keyup", this.handleKeyUp);
    }
}
export function handleKeyDown(this: Board, event: KeyboardEvent) {
    const { key } = event;
    if (this.keyPresses.has(key)) return;
    this.keyPresses.add(key);

    const { arr: ARR, das: DAS, sdf: SDF, controls: {
        left,
        right,
        hardDrop,
        softDrop,
        rotateCW,
        rotateCCW,
        hold,
        flip
    } } = Config.config;
    const activeMino = this.activeTetramino.current;
    if (!activeMino) return;
    const { controlEvents, controlEvents: { onLeft, onRight } } = this;
    let preventDefault = true;
    switch (key.toLowerCase()) {
        case left:
            if (onLeft.das) return;
            this.clearShiftRepeat(onLeft);
            this.clearShiftRepeat(onRight);
            activeMino.moveLeft();
            onLeft.das = setTimeout(() => {
                activeMino.moveLeft();
                if (!ARR) while (activeMino.moveLeft()) { /* empty */ }
                onLeft.delay = setInterval(() => !this.paused && activeMino.moveLeft(), ARR);
            }, DAS);
            break;
        case right:
            if (onRight.das) return;
            this.clearShiftRepeat(onLeft);
            this.clearShiftRepeat(onRight);
            activeMino.moveRight();
            onRight.das = setTimeout(() => {
                activeMino.moveRight();
                if (!ARR) while (activeMino.moveRight()) { /* empty */ }
                onRight.delay = setInterval(() => !this.paused && activeMino.moveRight(), ARR);
            }, DAS);
            break;
        case softDrop:
            if (controlEvents.down) return;
            activeMino.moveDown();
            if (SDF != -1) controlEvents.down = setInterval(() => !this.paused && activeMino.moveDown(), 500 / SDF);
            else controlEvents.down = setInterval(() => !this.paused && activeMino.hardDrop(false), 0);
            break;
        case hardDrop:
            this.activeTetramino.current?.hardDrop();
            break;
        case rotateCW:
            this.activeTetramino.current?.rotateRight();
            break;
        case rotateCCW:
            this.activeTetramino.current?.rotateLeft();
            break;
        case flip:
            this.activeTetramino.current?.rotate180();
            break;
        case hold:
            this.activeTetramino.current?.hold();
            break;
        default:
            preventDefault = false;
            break;
    }
    if (preventDefault) event.preventDefault();
}
export function handleKeyUp(this: Board, { key }: KeyboardEvent) {
    const { left, right, softDrop } = Config.config.controls;
    key = key.toLowerCase();
    this.keyPresses.delete(key);
    //TODO: refactor code here
    const { controlEvents, controlEvents: { onLeft, onRight } } = this;
    if (key == left) this.clearShiftRepeat(onLeft);
    if (key == right) this.clearShiftRepeat(onRight);
    if (key == softDrop) {
        if (controlEvents.down) clearInterval(controlEvents.down);
        controlEvents.down = null;
    }
}

export const controlEvents: {
    onLeft: { das: ReturnType<typeof setTimeout> | null, delay: ReturnType<typeof setInterval> | null },
    onRight: { das: ReturnType<typeof setTimeout> | null, delay: ReturnType<typeof setInterval> | null },
    down: ReturnType<typeof setInterval> | null
} = { onLeft: { das: null, delay: null }, onRight: { das: null, delay: null }, down: null }

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