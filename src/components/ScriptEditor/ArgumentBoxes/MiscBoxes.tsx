import { Dispatch, SetStateAction } from 'react';
import { Command, Operator, variables, Equality } from '../scriptTypes';
import { Operation } from '../scriptTypes';
import { ArgumentProps } from './DynamicNumber';

interface OperationProps {
    script: Command[][];
    activeDynamicNumber: Operation;
    setScript: Dispatch<SetStateAction<Command[][]>>;
}

export function OperationBox({ script, activeDynamicNumber, setScript }: OperationProps) {
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

export function VariableBox({ script, activeCommand, setScript, argIndex }: ArgumentProps) {
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

export function EqualityBox({ script, activeCommand, setScript, argIndex }: ArgumentProps) {
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