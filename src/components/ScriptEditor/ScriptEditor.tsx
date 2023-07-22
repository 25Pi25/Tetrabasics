import { Dispatch, SetStateAction, useState } from 'react';
import './ScriptEditor.css';
import { Command, variables } from './scriptTypes';
import { CommandBox } from './ArgumentBoxes/CommandBox';

export default function DynamicContentComponent({script, setScript}: {
    script: Command[][],
    setScript: Dispatch<SetStateAction<Command[][]>>
}) {
    const [activeButton, setActiveButton] = useState<number>(0);
    // const [script, setScript] = useState<Command[][]>([[{ type: "", args: [] }]]);

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
            <button onClick={() => {
                scriptClone.push([{ type: "", args: [] }]);
                setScript(scriptClone)
            }}>+</button>
            <button onClick={() => {
                if (scriptClone.length > 1) scriptClone.pop();
                setScript(scriptClone)
            }}>-</button>
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
        <button onClick={() => {
            const modifiedScript = scriptClone.map(x => x.slice(0, -1))
            const blob = new Blob([JSON.stringify({ functions: modifiedScript, variables })], { type: 'application/json' });
            const selector = document.createElement("a");
            const link = URL.createObjectURL(blob);
            selector.href = link;
            selector.download = "script.json";
            selector.click();
            selector.parentElement?.removeChild(selector);
            URL.revokeObjectURL(link);
        }}>Export!</button>
    </div>
}