import { Argument, Command, DynamicNumber, Equality, getNewArgs } from '../ScriptEditor/scriptTypes';
import { Board, BoardMeta } from './Board';

export function startScriptExecution(this: Board) {
    const { functions } = this.script;
    if (!functions[0]) return;
    for (const command of functions[0]) {
        void this.executeCommand(command)
    }
}

export async function executeCommand(this: Board, { type, args }: Command) {
    const { variables } = this.script;
    const argTypes = getNewArgs(type).map(({ type }) => type)
    if (args.some(({ type }, i) => type != argTypes[i])) return;
    switch (type) {
        case "if":
            if (this.calculateCondition(args))
                await this.executeCommand(args[3].value as Command)
            return;
        case "wait":
            await new Promise(res => setTimeout(res, variables[args[0].value as string]));
            return;
        case "winGame":
            // TODO: win game you fucking imbecile
            return;
        case "":
        default:
            return;
    }
}

export function getVariable(this: Board, variable: string) {
    return this.script.variables[variable];
}

export function calculateCondition(this: Board, args: Argument[]) {
    const [var1, var2] = [args[0], args[2]].map(arg => {
        const { numberType, value } = arg.value as DynamicNumber;
        switch (numberType) {
            case "number":
                return value ?? 0;
            case "variable":
                return this.script.variables[value] ?? 0;
            case "meta":
                return this.meta[value as keyof BoardMeta] ?? 0;
        }
    });
    switch (args[1].value as Equality) {
        case Equality.EQUALS:
            return var1 == var2;
        case Equality.GREATER:
            return var1 > var2;
        case Equality.GREATEREQUAL:
            return var1 >= var2;
        case Equality.LESS:
            return var1 < var2;
        case Equality.LESSEQUAL:
            return var1 <= var2;
        case Equality.NOT:
            return var1 != var2;
    }
}