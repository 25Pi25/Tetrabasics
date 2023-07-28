import './Menu.css';

export default function Menu() {
  return <>
    <h1>Tetrabasics</h1>
    <div className='title-buttons'>
      <a href="/freeplay" className='title-button'>FREE PLAY</a>
      <a href="/editor" className='title-button'>EDITOR</a>
    </div>
  </>
}