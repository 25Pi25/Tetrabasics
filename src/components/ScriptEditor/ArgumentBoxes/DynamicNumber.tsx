import { Dispatch, SetStateAction } from 'react';
import { BoardMeta, defaultBoardMeta } from '../../Board/Board';
import { Command, DynamicNumber, DynamicNumberType, argDefault, Operator, Operation, variables, dynamicNumberType } from '../scriptTypes';
import { OperationBox } from './MiscBoxes';

export interface ArgumentProps {
    script: Command[][];
    activeCommand: Command;
    setScript: Dispatch<SetStateAction<Command[][]>>;
    argIndex: number;
}

export function DynamicNumberBox({ script, activeCommand, setScript, argIndex }: ArgumentProps) {
    const argument = activeCommand.args[argIndex].value as DynamicNumber;
    return <div style={{ border: "2px solid blue" }}>
        <select value={argument.numberType}
            onChange={({ target: { value } }) => {
                if (argument.numberType == value) return;
                argument.numberType = value as DynamicNumberType;
                switch (argument.numberType) {
                    case "number":
                        argument.value = 0;
                        break;
                    case "meta":
                        argument.value = "lines" as keyof BoardMeta;
                        break;
                    case "operation":
                        argument.value = {
                            number1: argDefault.dynamicNumber().value,
                            operation: Operator.PLUS,
                            number2: argDefault.dynamicNumber().value
                        } as Operation;
                        break;
                    case "variable":
                        argument.value = variables[0];
                        break;
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
            value={argument.value as string}
            onChange={({ target: { value } }) => {
                argument.value = parseInt(value);
                setScript(script);
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
            <OperationBox
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

export function NestedDynamicNumberBox({ script, activeDynamicNumber, setScript, numberIndex }: NestedNumberProps) {
    const argument = activeDynamicNumber[numberIndex == 1 ? "number1" : "number2"];
    return <div style={{ border: "2px solid blue" }}>
        <select value={argument.numberType}
            onChange={({ target: { value } }) => {
                if (argument.numberType == value) return;
                argument.numberType = value as DynamicNumberType;
                switch (argument.numberType) {
                    case "number":
                        argument.value = 0;
                        break;
                    case "meta":
                        argument.value = "lines" as keyof BoardMeta;
                        break;
                    case "operation":
                        argument.value = {
                            number1: argDefault.dynamicNumber().value,
                            operation: Operator.PLUS,
                            number2: argDefault.dynamicNumber().value
                        } as Operation;
                        break;
                    case "variable":
                        argument.value = variables[0];
                        break;
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
            value={argument.value as string}
            onChange={({ target: { value } }) => {
                argument.value = parseInt(value);
                setScript(script);
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
            <OperationBox
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