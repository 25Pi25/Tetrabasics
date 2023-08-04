import { useState } from 'react';
import './ConfigBar.css';
import Config, { ConfigControls, ConfigOptions } from '../config';

export default function ConfigBar() {
    const [configRef, setConfigRef] = useState<ConfigOptions>(JSON.parse(JSON.stringify(Config.config)) as ConfigOptions);

    function setControlKey(key: keyof ConfigControls) {
        document.removeEventListener("keydown", finish);
        const oldRef = configRef.controls[key];
        setConfigRef(config => ({ ...config, controls: { ...config.controls, [key]: "Press any key..." } }))
        document.addEventListener("keydown", finish);
        const timeout = setTimeout(finish, 5000)

        function finish(newKey?: KeyboardEvent) {
            document.removeEventListener("keydown", finish);
            clearTimeout(timeout);
            const lowerKey = newKey?.key;
            setConfigRef(config => ({ ...config, controls: { ...config.controls, [key]: lowerKey ?? oldRef } }))
            if (!lowerKey) return;
            Config.config.controls[key] = lowerKey;
            newKey?.preventDefault();
        }
    }

    return <div className='config'>
        <button onClick={() => {
            if (Object.values(configRef.controls).some(x => x == "Press any key...")) return;
            Config.cookies.set("config", JSON.stringify(configRef));
            Config.createConfig();
        }}>Save!</button>
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
    </div>
}