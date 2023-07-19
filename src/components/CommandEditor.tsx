import { useState, Dispatch, SetStateAction } from 'react';
import './CommandEditor.css';

const dynamicNumberType = ["number", "variable"] as const;
type DynamicNumberType = typeof dynamicNumberType[number];
interface DynamicNumber {
    numberType: DynamicNumberType,
    value: number | string
}
enum Equality {
    EQUALS = "=",
    LESS = "<",
    GREATER = ">",
    LESSEQUAL = "<=",
    GREATEREQUAL = ">=",
    NOT = "!"
}

const commandType = ["", "if", "function", "setVariable", "addVariable"] as const;
type CommandType = typeof commandType[number];
interface ArgumentType {
    type: "dynamicNumber" | "equality" | "command",
    value: DynamicNumber | Equality | Command
}

interface Command {
    type: CommandType,
    args: ArgumentType[]
}

const argDefault: Record<string, ArgumentType> = {
    dynamicNumber: { type: "dynamicNumber", value: { numberType: "number", value: 0 } },
    equality: { type: "equality", value: Equality.EQUALS },
    command: { type: "command", value: { type: "", args: [] } }
}
function getNewArgs(commandType: CommandType): ArgumentType[] {
    const { dynamicNumber, equality, command } = argDefault;
    switch (commandType) {
        case "":
            return [];
        case "if":
            return [dynamicNumber, equality, dynamicNumber, command];
        case "function":
            return [dynamicNumber];
        case "setVariable":
            return [dynamicNumber, dynamicNumber];
        default:
            return [];
    }
}

export default function DynamicContentComponent() {
    const [activeButton, setActiveButton] = useState<number>(0);
    const [script, setScript] = useState<Command[][]>([[{ type: "", args: [] }]]);

    const buttons = script.map((_, i) => `Function ${i || "Main"}`);
    const scriptClone = [...script];

    return <div style={{}}>
        <div style={{}}>
            {buttons.map((button, i) => (
                <button
                    key={i}
                    onClick={() => setActiveButton(i)}
                    style={{ backgroundColor: activeButton === i ? 'lightblue' : 'white' }}
                >{button}</button>
            ))}
        </div>
        <div className='editor-border'>
            {scriptClone[activeButton].map((command, i) => <CommandBox
                script={scriptClone}
                activeCommand={command}
                setScript={setScript}
                fullFunction={scriptClone[activeButton]}
                commandIndex={i}
                recurseLevel={0}
                key={i}
            />)}
        </div>
    </div>
}

interface CommandProps {
    script: Command[][];
    activeCommand: Command;
    setScript: Dispatch<SetStateAction<Command[][]>>;
    fullFunction: Command[] | ArgumentType;
    commandIndex: number;
    recurseLevel: number
}

interface ArgumentProps {
    script: Command[][];
    activeCommand: Command;
    setScript: Dispatch<SetStateAction<Command[][]>>;
    argIndex: number;
}

function CommandBox({ script, activeCommand, setScript, fullFunction, commandIndex, recurseLevel }: CommandProps) {
    return <div style={{ display: "flex", flexDirection: "row", border: `2px solid ${recurseLevel ? "red" : "green"}`, flexWrap: "wrap" }}>
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
                    return <DynamicNumberBox script={...script}
                        setScript={setScript}
                        activeCommand={activeCommand}
                        argIndex={i}
                        key={i} />
                case "equality":
                    return <EqualityBox script={...script}
                        setScript={setScript}
                        activeCommand={activeCommand}
                        argIndex={i}
                        key={i} />
                default:
                    return <div key={i}></div>
            }
        })}
        {Array.isArray(fullFunction) && <button onClick={() => {
            if (fullFunction.length != 1) fullFunction.splice(commandIndex, 1);
            setScript(script);
        }}>-</button>}
        {!Array.isArray(fullFunction) && <button onClick={() => {
            fullFunction.value = {
                type: "",
                args: []
            }
            setScript(script);
        }}>-</button>}
    </div>
}

function DynamicNumberBox({ script, activeCommand, setScript, argIndex }: ArgumentProps) {
    const argument = activeCommand.args[argIndex].value as DynamicNumber;
    return <div style={{ border: "2px solid blue" }}>
        <select value={argument.numberType}
            onChange={({ target: { value } }) => {
                argument.numberType = value as DynamicNumberType;
                setScript(script);
            }}
            key={argIndex}>
            {dynamicNumberType.map(x => <option value={x} key={x}>{x}</option>)}
        </select>
        {argument.numberType == "number" && <input
            type='number'
            min={0}
            max={100}></input>}
        {argument.numberType == "variable" && <input
            type='text'
            minLength={0}
            maxLength={10}
            size={3}></input>}
    </div>
}

function EqualityBox({ script, activeCommand, setScript, argIndex }: ArgumentProps) {
    const [localEqualityType, setLocalEqualityType] = useState<Equality>(Equality.EQUALS)
    return <div style={{ border: "2px solid purple" }}>
        <select value={localEqualityType}
            onChange={({ target: { value } }) => {
                activeCommand.args[argIndex].value = value as Equality;
                setLocalEqualityType(activeCommand.args[argIndex].value as Equality)
                setScript(script);
            }}
            key={argIndex}>
            {Object.values(Equality).map(x => <option value={x} key={x}>{x}</option>)}
        </select>
    </div>
}