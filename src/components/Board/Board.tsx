import { Stage } from '@pixi/react';
import './Board.css';
import { Component, RefObject, createRef } from 'react';
import { TetraColor, TetraminoType } from '../../types';
import ActiveTetramino from '../ActiveTetramino';
import TetraminoDisplay from '../TetraminoDisplay';
import BoardCell from './BoardCell';
import { Argument, Command, Script } from '../ScriptEditor/scriptTypes';
import { clearShiftRepeat, controlEvents, handleKeyDown, handleKeyUp, setPaused } from './controls';
import { fillNextPieces, finishScript, gameOver, injectGarbage, resetBoard, setDimensions, setMap, updateClearedLines, updateNext } from './gameControls';
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
    allClear: number,
    height: number,
    mapHeight: number
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
    allClear: 0,
    height: 0,
    mapHeight: 0
}

export interface BoardCellInfo {
    color: TetraColor;
    isOccupied: boolean;
    isMapCell?: boolean;
}

interface BoardProps {
    script?: Script;
    startNow?: boolean;
}
interface BoardState {
    cells: BoardCellInfo[][];
    next: TetraminoType[];
    hold: { type: TetraminoType, used: boolean };
    display: string;
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
    startGameNextRender = false;

    hold: { type: TetraminoType, used: boolean } = { type: TetraminoType.NONE, used: false };
    next: TetraminoType[] = [];
    display = "";
    refillPieces = true;
    state: BoardState = { cells: this.cells, next: this.next, hold: this.hold, display: this.display };
    timeouts: ({ name: "waitCommand", timeout: ReturnType<typeof setTimeout> })[] = [];

    constructor(props: BoardProps) {
        super(props);
        const { script, startNow } = props;
        this.activeTetramino = createRef<ActiveTetramino>()
        const { functions, variables } = script ?? { functions: [], variables: [] }
        this.script = {
            functions,
            variables: variables.reduce((a: Record<string, number>, b) => ({ ...a, [b]: 0 }), {})
        };
        if (startNow) this.startGameNextRender = true;
    }
    componentDidMount() {
        this.setState(({ cells: this.cells }));
        // TODO: Run conditional if the board disables new next pieces
        this.setMap();
    }
    componentDidUpdate() {
        if (!this.startGameNextRender || !this.activeTetramino.current) return;
        void this.startGame();
        this.startGameNextRender = false;
    }
    render() {
        const renderedHeight = this.height - Board.matrixBuffer + Board.matrixVisible;
        return <div className='game'>
            <div className='left-displays'>
                <TetraminoDisplay width={100} height={100} type={this.state.hold.type} overrideColor={this.state.hold.used ? TetraColor.HELD : undefined} />
                <p className='text-display'>{this.display}</p>
            </div>
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
        </div>
    }
    // Start game -> I mean this is pretty self-explanatory
    async startGame() {
        this.setPaused(false);
        this.setMap();
        if (!this.finishedScript) await this.finishScript();
        this.updateNext();
        const { current } = this.activeTetramino;
        if (!current) return;
        current.getNextPiece();
        void this.startScriptExecution();
    }
    // scriptExecution.tsx
    finishedScript = true;
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
    finishScript = finishScript;
    gameOver = gameOver;
    setDimensions = setDimensions;
}