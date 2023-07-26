import { Dispatch, SetStateAction, ChangeEvent } from 'react';
import { Command, Argument, CommandType, getNewArgs, commandType } from '../scriptTypes';
import { DynamicNumberBox } from './DynamicNumber';
import { EqualityBox, VariableBox } from './MiscBoxes';

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
                        activeCommand={argument.value}
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
                    return <p key={i}>{argument.value}</p>
                case "string":
                    return <input
                        type='text'
                        maxLength={10000}
                        key={i}
                        value={argument.value}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            if (e.target.value) argument.value = e.target.value;
                            setScript(script);
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