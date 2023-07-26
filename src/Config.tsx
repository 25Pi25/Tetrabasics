import { useState } from 'react';
import './Config.css';
import Cookies from 'universal-cookie';

export interface ConfigOptions {
    das: number
    arr: number
    sdf: number
    controls: ConfigControls
}
interface ConfigControls {
    left: string
    right: string
    hardDrop: string
    softDrop: string
    rotateCW: string
    rotateCCW: string
    hold: string
    flip: string
    reset: string
}

export default function Config() {
    const cookies = new Cookies();
    let config: ConfigOptions;
    try {
        config = JSON.parse(cookies.get<string>("config")) as ConfigOptions;
    } catch {
        config = { controls: {} } as ConfigOptions;
    }
    const [configRef, setConfigRef] = useState<ConfigOptions>({
        das: config.das ?? 33,
        arr: config.arr ?? 167,
        sdf: config.sdf ?? -1,
        controls: {
            left: config.controls?.left ?? "ArrowLeft",
            right: config.controls?.right ?? "ArrowRight",
            hardDrop: config.controls?.hardDrop ?? " ",
            softDrop: config.controls?.softDrop ?? "ArrowDown",
            rotateCW: config.controls?.rotateCW ?? "x",
            rotateCCW: config.controls?.rotateCCW ?? "z",
            hold: config.controls?.hold ?? "c",
            flip: config.controls?.flip ?? "a",
            reset: config.controls?.reset ?? "r"
        }
    });

    function setControlKey(key: keyof ConfigControls) {
        document.removeEventListener("keydown", finish);
        const oldRef = configRef.controls[key];
        setConfigRef(config => ({ ...config, controls: { ...config.controls, [key]: "Press any key..." } }))
        document.addEventListener("keydown", finish);
        const timeout = setTimeout(finish, 5000)
    
        function finish(newKey?: KeyboardEvent) {
            document.removeEventListener("keydown", finish);
            clearTimeout(timeout);
            setConfigRef(config => ({ ...config, controls: { ...config.controls, [key]: newKey?.key ?? oldRef } }))
        }
    }

    return <div className='config'>
        <h1>Config</h1>
        <div>
            <p>DAS</p>
            <input type="number" defaultValue={configRef.das} min={0} max={1000}
                onChange={({ target: { value } }) => setConfigRef(config => ({ ...config, das: parseInt(value) ?? 0 }))} />
        </div>
        <div>
            <p>ARR</p>
            <input type="number" defaultValue={configRef.arr} min={0} max={1000}
                onChange={({ target: { value } }) => setConfigRef(config => ({ ...config, arr: parseInt(value) ?? 0 }))} />
        </div>
        <div>
            <p>SDF</p>
            <input type="number" defaultValue={configRef.sdf} min={-1} max={40}
                onChange={({ target: { value } }) => setConfigRef(config => ({ ...config, sdf: parseInt(value) ?? 0 }))} />
        </div>
        <h2>Controls</h2>
        <div>
            <p>Move Left</p>
            <a onClick={() => setControlKey("left")}
            >{configRef.controls.left}</a>
        </div>
        <div>
            <p>Move Right</p>
            <a onClick={() => setControlKey("right")}
            >{configRef.controls.right}</a>
        </div>
        <div>
            <p>Soft Drop</p>
            <a onClick={() => setControlKey("softDrop")}
            >{configRef.controls.softDrop}</a>
        </div>
        <div>
            <p>Hard Drop</p>
            <a onClick={() => setControlKey("hardDrop")}
            >{configRef.controls.hardDrop}</a>
        </div>
        <div>
            <p>Rotate CW</p>
            <a onClick={() => setControlKey("rotateCW")}
            >{configRef.controls.rotateCW}</a>
        </div>
        <div>
            <p>Rotate CCW</p>
            <a onClick={() => setControlKey("rotateCCW")}
            >{configRef.controls.rotateCCW}</a>
        </div>
        <div>
            <p>Hold</p>
            <a onClick={() => setControlKey("hold")}
            >{configRef.controls.hold}</a>
        </div>
        <div>
            <p>180</p>
            <a onClick={() => setControlKey("flip")}
            >{configRef.controls.flip}</a>
        </div>
        <div>
            <p>Reset</p>
            <a onClick={() => setControlKey("reset")}
            >{configRef.controls.reset}</a>
        </div>
        <button onClick={() => {
            if (Object.values(configRef.controls).some(x => x == "Press any key...")) return;
            cookies.set("config", JSON.stringify(configRef));
        }}>Save!</button>
    </div>
}