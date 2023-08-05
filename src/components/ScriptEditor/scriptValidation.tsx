import { defaultBoardMeta } from '../Board/Board';
import { ArgumentType, CommandType, DynamicNumberType, Equality, Operator, Script, argumentType, commandType, dynamicNumberType, getArgTypes } from './scriptTypes';

export function isScript(script: object): script is Script {
    if (!('variables' in script && 'functions' in script)) return false;
    if (!isStringArray(script.variables)) return false;
    return is2DFunctionArray(script.functions, script.variables);
}

//utils
function isObject(object: unknown): object is object {
    return object != null && typeof object == 'object';
}
function is2DArray(array: unknown): array is unknown[][] {
    return (array instanceof Array) && array.every(subarray => subarray instanceof Array);
}
const isArgumentType = (str: string): str is ArgumentType => argumentType.includes(str as ArgumentType);
const isCommandType = (str: string): str is CommandType => commandType.includes(str as CommandType);
const isDynamicNumberType = (str: string): str is DynamicNumberType => dynamicNumberType.includes(str as DynamicNumberType);

function isStringArray(variables: unknown): variables is string[] {
    return (variables instanceof Array) && variables.every(variable => typeof variable === 'string');
}

//main
function is2DFunctionArray(functions: unknown, variables: string[]): boolean {
    if (!is2DArray(functions)) return false;
    return functions.every(subfunction => subfunction.every(command => isValidCommand(command, variables)));
}

function isValidCommand(command: unknown, variables: string[]): boolean {
    if (!isObject(command)) return false;
    if (!('type' in command && 'args' in command)) return false;
    if (typeof command.type != 'string' || !isCommandType(command.type)) return false;
    if (!(command.args instanceof Array)) return false;
    const expectedArgs = getArgTypes(command.type);
    if (command.args.length != expectedArgs.length) return false;
    return command.args.every((arg, i) => isValidArg(arg, expectedArgs[i], variables));
}

function isValidArg(arg: unknown, expectedArg: ArgumentType, variables: string[]): boolean {
    if (!isObject(arg)) return false;
    if (!('type' in arg && 'value' in arg)) return false;
    const { type, value } = arg;
    if (typeof type != 'string' || !isArgumentType(type) || type != expectedArg) return false;

    switch (type) {
        case "variable":
            return typeof value == 'string' && variables.includes(value);
        case "string":
            return typeof value == 'string';
        case "command":
            return isValidCommand(value, variables);
        case "dynamicNumber":
            return isDynamicNumber(value, variables);
        case "equality":
            return typeof value == 'string' && Object.values(Equality).includes(value as Equality);
        case "plainText":
            return true;
    }
}

function isDynamicNumber(number: unknown, variables: string[]): boolean {
    if (!isObject(number)) return false;
    if (!('numberType' in number && 'value' in number)) return false;
    const { numberType, value } = number;
    if (typeof numberType != 'string' || !isDynamicNumberType(numberType)) return false;

    switch (numberType) {
        case "number":
            return typeof value == 'number';
        case 'variable':
            return typeof value == 'string' && variables.includes(value);
        case 'meta':
            return typeof value == 'string' && Object.keys(defaultBoardMeta).includes(value);
        case 'operation':
            return isObject(value) && 'number1' in value && 'operation' in value && 'number2' in value &&
                isDynamicNumber(value.number1, variables) && isDynamicNumber(value.number2, variables) && 
                Object.values(Operator).includes(value.operation as Operator);
    }
}