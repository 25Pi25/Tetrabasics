import { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { Argument, Command, CommandType, DynamicNumber, DynamicNumberType, Equality, Operation, Operator, argDefault, commandType, dynamicNumberType, getNewArgs, variables } from './scriptTypes';
import { BoardMeta, defaultBoardMeta } from '../Board/Board';

interface CommandProps {
    script: Command[][];
    activeCommand: Command;
    setScript: Dispatch<SetStateAction<Command[][]>>;
    fullFunction: Command[] | Argument;
    commandIndex: number;
    recurseLevel: number
}

export function CommandBox({ script, activeCommand, setScript, fullFunction, commandIndex, recurseLevel }: CommandProps) {
    return <div style={{ display: "flex", flexDirection: "row", border: `2px solid ${recurseLevel ? "red" : "green"}`, flexWrap: "wrap", alignItems: "center" }}>
        <select value={activeCommand.type}
            onChange={({ target: { value } }) => {
                if (!Array.isArray(fullFunction)) {
                    fullFunction.value = {
                        type: value as CommandType,
                        args: getNewArgs(value as CommandType)
                    }
                } else {
                    fullFunction[commandIndex] = {
                        type: value as CommandType,
                        args: getNewArgs(value as CommandType)
                    }
                    if (fullFunction.every(command => command.type != ""))
                        fullFunction.push({ type: "", args: [] })
                }
                setScript(script);
            }}>
            {commandType.map((x, i) => <option value={x} key={i}>{x}</option>)}
        </select>
        {activeCommand.args.map((argument, i) => {
            switch (argument.type) {
                case "command":
                    return <CommandBox
                        script={script}
                        activeCommand={argument.value as Command}
                        setScript={setScript}
                        commandIndex={i}
                        fullFunction={argument}
                        recurseLevel={recurseLevel + 1}
                        key={i} />
                case "dynamicNumber":
                    return <DynamicNumberBox script={script}
                        setScript={setScript}
                        activeCommand={activeCommand}
                        argIndex={i}
                        key={i} />
                case "equality":
                    return <EqualityBox script={script}
                        setScript={setScript}
                        activeCommand={activeCommand}
                        argIndex={i}
                        key={i} />
                case "variable":
                    return <VariableBox script={script}
                        setScript={setScript}
                        activeCommand={activeCommand}
                        argIndex={i}
                        key={i} />
                case "plainText":
                    return <p key={i}>{argument.value as string}</p>
                case "string":
                    return <input
                        type='text'
                        maxLength={10000}
                        key={i}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            if (e.target.value) argument.value = e.target.value
                        }} />
                default:
                    return <div key={i}></div>
            }
        })}
        {Array.isArray(fullFunction) && <>
            <button onClick={() => {
                if (commandIndex + 1 != fullFunction.length && fullFunction.length != 1)
                    fullFunction.splice(commandIndex, 1);
                setScript(script);
            }}>-</button>
            {!!commandIndex && fullFunction.length > 1 &&
                <button onClick={() => {
                    const temp = fullFunction[commandIndex];
                    fullFunction[commandIndex] = fullFunction[commandIndex - 1];
                    fullFunction[commandIndex - 1] = temp;
                    if (commandIndex + 1 == fullFunction.length)
                        fullFunction.push({ type: "", args: [] })
                    setScript(script);
                }}>↑</button>
            }
            {commandIndex + 1 != fullFunction.length && fullFunction.length > 1 &&
                <button onClick={() => {
                    const temp = fullFunction[commandIndex];
                    fullFunction[commandIndex] = fullFunction[commandIndex + 1];
                    fullFunction[commandIndex + 1] = temp;
                    if (commandIndex + 1 == fullFunction.length)
                        fullFunction.push({ type: "", args: [] })
                    setScript(script);
                }}>↓</button>
            }
        </>}
        {!Array.isArray(fullFunction) && <button onClick={() => {
            fullFunction.value = {
                type: "",
                args: []
            }
            setScript(script);
        }}>-</button>}
    </div>
}

interface ArgumentProps {
    script: Command[][];
    activeCommand: Command;
    setScript: Dispatch<SetStateAction<Command[][]>>;
    argIndex: number;
}

function DynamicNumberBox({ script, activeCommand, setScript, argIndex }: ArgumentProps) {
    const argument = activeCommand.args[argIndex].value as DynamicNumber;
    return <div style={{ border: "2px solid blue" }}>
        <select value={argument.numberType}
            onChange={({ target: { value } }) => {
                argument.numberType = value as DynamicNumberType;
                if (argument.numberType == "operation") {
                    argument.value = {
                        number1: argDefault.dynamicNumber().value,
                        operation: Operator.PLUS,
                        number2: argDefault.dynamicNumber().value
                    } as Operation;
                }
                setScript(script);
            }}
            key={argIndex}>
            {dynamicNumberType.map(x => <option value={x} key={x}>{x}</option>)}
        </select>
        {argument.numberType == "number" && <input
            type='number'
            min={-1000000}
            max={1000000}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.value) argument.value = e.target.value
            }} />}
        {argument.numberType == "variable" && <select value={argument.value as string}
            onChange={({ target: { value } }) => {
                argument.value = value;
                setScript(script);
            }}>
            {Object.values(variables).map(x => <option value={x} key={x}>{x}</option>)}
        </select>}
        {argument.numberType == "meta" && <select value={argument.value as keyof BoardMeta}
            onChange={({ target: { value } }) => {
                argument.value = value as keyof BoardMeta;
                setScript(script);
            }}>
            {Object.keys(defaultBoardMeta).map(x => <option value={x} key={x}>{x}</option>)}
        </select>}
        {argument.numberType == "operation" && <div style={{ border: "2px solid aqua" }}>
            <NestedDynamicNumberBox
                script={script}
                setScript={setScript}
                activeDynamicNumber={argument.value as Operation}
                numberIndex={1}
                key={1} />
            <Operation
                script={script}
                setScript={setScript}
                activeDynamicNumber={argument.value as Operation} />
            <NestedDynamicNumberBox
                script={script}
                setScript={setScript}
                activeDynamicNumber={argument.value as Operation}
                numberIndex={2}
                key={2} />
        </div>}
    </div>
}

interface NestedNumberProps {
    script: Command[][];
    activeDynamicNumber: Operation;
    setScript: Dispatch<SetStateAction<Command[][]>>;
    numberIndex: number;
}

function NestedDynamicNumberBox({ script, activeDynamicNumber, setScript, numberIndex }: NestedNumberProps) {
    const argument = activeDynamicNumber[numberIndex == 1 ? "number1" : "number2"];
    return <div style={{ border: "2px solid blue" }}>
        <select value={argument.numberType}
            onChange={({ target: { value } }) => {
                if (argument.numberType == value) return;
                argument.numberType = value as DynamicNumberType;
                if (argument.numberType == "operation") {
                    argument.value = {
                        number1: argDefault.dynamicNumber().value,
                        operation: Operator.PLUS,
                        number2: argDefault.dynamicNumber().value
                    } as Operation;
                }
                setScript(script);
            }}
            key={numberIndex}>
            {dynamicNumberType.map(x => <option value={x} key={x}>{x}</option>)}
        </select>
        {argument.numberType == "number" && <input
            type='number'
            min={-1000000}
            max={1000000}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.value) argument.value = e.target.value
            }} />}
        {argument.numberType == "variable" && <select value={argument.value as string}
            onChange={({ target: { value } }) => {
                argument.value = value;
                setScript(script);
            }}>
            {Object.values(variables).map(x => <option value={x} key={x}>{x}</option>)}
        </select>}
        {argument.numberType == "meta" && <select value={argument.value as keyof BoardMeta}
            onChange={({ target: { value } }) => {
                argument.value = value as keyof BoardMeta;
                setScript(script);
            }}>
            {Object.keys(defaultBoardMeta).map(x => <option value={x} key={x}>{x}</option>)}
        </select>}
        {argument.numberType == "operation" && <>
            <NestedDynamicNumberBox
                script={script}
                setScript={setScript}
                activeDynamicNumber={argument.value as Operation}
                numberIndex={1}
                key={1} />
            <Operation
                script={script}
                setScript={setScript}
                activeDynamicNumber={argument.value as Operation} />
            <NestedDynamicNumberBox
                script={script}
                setScript={setScript}
                activeDynamicNumber={argument.value as Operation}
                numberIndex={2}
                key={2} />
        </>}
    </div>
}

interface OperationProps {
    script: Command[][];
    activeDynamicNumber: Operation;
    setScript: Dispatch<SetStateAction<Command[][]>>;
}

function Operation({ script, activeDynamicNumber, setScript }: OperationProps) {
    return <div style={{ border: "2px solid purple" }}>
        <select value={activeDynamicNumber.operation}
            onChange={({ target: { value } }) => {
                activeDynamicNumber.operation = value as Operator;
                setScript(script);
            }} >
            {Object.values(Operator).map(x => <option value={x} key={x}>{x}</option>)}
        </select>
    </div>
}

function VariableBox({ script, activeCommand, setScript, argIndex }: ArgumentProps) {
    return <div style={{ border: "2px solid purple" }}>
        <select value={activeCommand.args[argIndex].value as string}
            onChange={({ target: { value } }) => {
                activeCommand.args[argIndex].value = value;
                setScript(script);
            }}
            key={argIndex}>
            {Object.values(variables).map(x => <option value={x} key={x}>{x}</option>)}
        </select>
    </div>
}

function EqualityBox({ script, activeCommand, setScript, argIndex }: ArgumentProps) {
    return <div style={{ border: "2px solid purple" }}>
        <select value={activeCommand.args[argIndex].value as Equality}
            onChange={({ target: { value } }) => {
                activeCommand.args[argIndex].value = value as Equality;
                setScript(script);
            }}
            key={argIndex}>
            {Object.values(Equality).map(x => <option value={x} key={x}>{x}</option>)}
        </select>
    </div>
}