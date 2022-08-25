export function Game(props) {
    return (<>
        <h1>Game</h1>
        <p>{props.props.userName}</p>
        <p>{props.props.roomName}</p>
    </>)
}