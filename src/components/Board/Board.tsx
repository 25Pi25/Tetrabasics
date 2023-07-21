import { Stage } from '@pixi/react';
import './Board.css';
import { Component, RefObject, createRef } from 'react';
import { TetraColor, TetraminoType } from '../../types';
import ActiveTetramino from '../ActiveTetramino';
import TetraminoDisplay from '../TetraminoDisplay';
import BoardCell from './BoardCell';
import DynamicContentComponent from '../ScriptEditor/ScriptEditor';
import { Argument, Command, Script } from '../ScriptEditor/scriptTypes';
import { clearShiftRepeat, controlEvents, handleKeyDown, handleKeyUp, setPaused } from './controls';
import { fillNextPieces, gameOver, injectGarbage, resetBoard, setDimensions, setMap, updateClearedLines, updateNext } from './gameControls';
import { calculateCondition, checkWhenConditions, executeCommand, executeFunction, getDynamicNumber, getVariable, startScriptExecution } from './scriptExecution';

// TODO: add finesse faults??
export interface BoardMeta {
    pieces: number,
    keys: number,
    holds: number,
    lines: number,
    attack: number,
    b2b: number,
    time: number,
    combo: number,
    finesseFaults: number,
    single: number,
    double: number,
    triple: number,
    quad: number,
    tsm: number,
    tss: number,
    tsd: number,
    tst: number,
    allClear: number
}
export const defaultBoardMeta = {
    pieces: 0,
    keys: 0,
    holds: 0,
    lines: 0,
    attack: 0,
    b2b: 0,
    time: 0,
    combo: 0,
    finesseFaults: 0,
    single: 0,
    double: 0,
    triple: 0,
    quad: 0,
    tsm: 0,
    tss: 0,
    tsd: 0,
    tst: 0,
    allClear: 0
}

export interface BoardCellInfo {
    color: TetraColor;
    isOccupied: boolean;
}

interface BoardProps {
    script?: Script;
}
interface BoardState {
    cells: BoardCellInfo[][];
    next: TetraminoType[];
    hold: { type: TetraminoType, used: boolean }
}
export class Board extends Component<BoardProps, BoardState> {
    static cellSize = 30;
    static matrixBuffer = 20;
    static matrixVisible = 3;
    activeTetramino: RefObject<ActiveTetramino>;
    width = 10;
    height = 20;
    cells: BoardCellInfo[][] = [];
    map = "";
    meta: BoardMeta = { ...defaultBoardMeta };
    script: { functions: Command[][], variables: Record<string, number> };
    whenConditions: Argument[][] = [];

    hold: { type: TetraminoType, used: boolean } = { type: TetraminoType.NONE, used: false };
    next: TetraminoType[] = [];
    refillPieces = true;
    state: BoardState = { cells: this.cells, next: this.next, hold: this.hold };
    timeouts: ({ name: "waitCommand" | "game", timeout: ReturnType<typeof setTimeout> })[] = [];

    constructor(props: BoardProps) {
        super(props);
        const { script } = props;
        this.activeTetramino = createRef<ActiveTetramino>()
        const { functions, variables } = script ?? { functions: [], variables: [] }
        this.script = {
            functions,
            variables: variables.reduce((a: Record<string, number>, b) => ({ ...a, [b]: 0 }), {})
        };
    }
    componentDidMount() {
        this.setState({ cells: this.cells });
        // TODO: Run conditional if the board disables new next pieces
        this.setMap();
        this.timeouts.push({ name: "game", timeout: setTimeout(this.startGame.bind(this), 1000) });
    }
    componentWillUnmount() {
        const gameStart = this.timeouts.find(x => x.name == "game")
        if (gameStart) clearTimeout(gameStart.timeout);
    }
    render() {
        const renderedHeight = this.height - Board.matrixBuffer + Board.matrixVisible;
        return <div className='game'>
            <TetraminoDisplay width={100} height={100} type={this.state.hold.type} overrideColor={this.state.hold.used ? TetraColor.HELD : undefined} />
            <Stage className='board'
                width={this.width * Board.cellSize}
                height={renderedHeight * Board.cellSize}>
                {this.cells
                    .filter((_, i) => i <= renderedHeight)
                    .map((arr, y) => arr.map(({ color, isOccupied }, x) => {
                        return <BoardCell board={this} coords={{ x, y }} isOccupied={isOccupied} color={color} key={`${x} ${y}`} />;
                    }))}
                <ActiveTetramino board={this} ref={this.activeTetramino} />
            </Stage>
            <div className='next'>
                {Array.from({ length: 5 }, (_, i) => {
                    return <TetraminoDisplay width={i ? 75 : 100} height={i ? 75 : 100} type={this.state.next[i]} key={i} />
                })}
            </div>
            <DynamicContentComponent />
        </div>
    }
    // Start game -> I mean this is pretty self-explanatory
    startGame() {
        this.setPaused(false);
        this.setMap();
        this.meta = { ...defaultBoardMeta };
        this.refillPieces = true;
        this.finishedScript = false;
        this.finishScriptEarly = false;
        this.updateNext();
        const { current } = this.activeTetramino;
        if (!current) return;
        current.getNextPiece();
        const { direction, coords, type } = current;
        current.setState({ direction, coords, type });
        void this.startScriptExecution();
    }
    // scriptExecution.tsx
    finishedScript = false;
    finishScriptEarly = false;
    startScriptExecution = startScriptExecution;
    executeFunction = executeFunction;
    executeCommand = executeCommand;
    checkWhenConditions = checkWhenConditions;
    getVariable = getVariable;
    calculateCondition = calculateCondition;
    getDynamicNumber = getDynamicNumber;

    // controls.tsx
    paused = true;
    keyPresses: Set<string> = new Set<string>();
    setPaused = setPaused;
    handleKeyDown = handleKeyDown.bind(this);
    handleKeyUp = handleKeyUp.bind(this);
    controlEvents = controlEvents;
    clearShiftRepeat = clearShiftRepeat;

    // gameControls.tsx
    resetBoard = resetBoard;
    fillNextPieces = fillNextPieces;
    setMap = setMap;
    injectGarbage = injectGarbage;
    updateClearedLines = updateClearedLines;
    updateNext = updateNext;
    gameOver = gameOver;
    setDimensions = setDimensions;
}