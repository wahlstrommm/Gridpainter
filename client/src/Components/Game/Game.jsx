import Chat from "./Chat/Chat";
import "./game.css";

export function Game(props) {

    const usersInfo = { userName: props.props.userName, roomName: props.props.roomName };

    return (<>
        <div className="pageWrapper">
            <div className="leftSideWrapper">
                <section className="gameInfo">
                    <h1>Game</h1>
                    <p>{props.props.userName}</p>
                    <p>{props.props.roomName}</p>
                </section>

                <section className="chatSection">
                    <Chat userInfo={usersInfo} />
                </section>
            </div>

            <div className="gameboardWrapper">
                <section className="gameboardSection">Gameboard</section>
            </div>

            <div className="resultboardWrapper">
                <section className="resultboardSection">Resultboard</section>
            </div>

        </div>
    </>);
}