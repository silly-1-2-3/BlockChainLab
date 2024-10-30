import React, {useState, useEffect} from 'react';
import {Button, Select, message, Card} from 'antd';
import {useLocation, useNavigate} from "react-router-dom";
import {SimpleAMMContract, BuyMyRoomContract, web3} from '../utils/contract';
import './main.css';
import Title from "antd/es/typography/Title";

const {Option} = Select;

interface Room {
    price: number;
    owner: string;
    onListTimestamp: number;
    onList: boolean;
}

interface FullRoom {
    tokenId: number;
    price: number;
    owner: string;
    onListTimestamp: number;
    onList: boolean;
}

const MainPage: React.FC = () => {
    const location = useLocation();
    const [account, setAccount] = useState<string>('');
    const navigate = useNavigate();

    const onLogout = async () => {
        setAccount('');
        navigate('/');
    }

    const [newRoomOwner, setNewRoomOwner] = useState<string>();
    const buildRoom = async () => {
        if (BuyMyRoomContract) {
            try {
                console.log(newRoomOwner);
                console.log(account);
                await BuyMyRoomContract.methods.BuildRoom(newRoomOwner).send({from: account});
            } catch (error) {
                // @ts-ignore
                message.error(`error when building room: ${error.message}`);
            }
        } else {
            alert("no BuyMyRoomContract");
        }
    }

    const [listTokenId, setListTokenId] = useState<number>();
    const [listPrice, setListPrice] = useState<number>();
    const listRoom = async () => {
        if (BuyMyRoomContract) {
            try {
                if (listPrice !== undefined && listTokenId !== undefined) {
                    if (listPrice < 0.001 || listPrice > 50)
                        message.error("too much credits you are using!");
                    const __num = web3.utils.toWei(listPrice, "ether"); // to 1/1000 ether
                    await BuyMyRoomContract.methods.ListRoom(listTokenId, __num).send({from: account});
                } else {
                    message.error("no listPrice or listTokenId value");
                }
            } catch (error) {
                // @ts-ignore
                message.error(`error when listing room: ${error.message}`);
            }
        } else {
            alert("no BuyMyRoomContract");
        }
    }

    const [unlistTokenId, setUnlistTokenId] = useState<number>();
    const unlistRoom = async () => {
        if (BuyMyRoomContract) {
            try {
                if (unlistTokenId !== undefined) {
                    await BuyMyRoomContract.methods.UnlistRoom(unlistTokenId).send({from: account});
                } else {
                    message.error("no unlistTokenId value");
                }
            } catch (error) {
                // @ts-ignore
                message.error(`error when unlisting room: ${error.message}`);
            }
        } else {
            alert("no BuyMyRoomContract");
        }
    }

    const [buyTokenId, setBuyTokenId] = useState<number>();
    const buyRoom = async () => {
        if (BuyMyRoomContract && SimpleAMMContract) {
            try {
                const maxUint = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
                await SimpleAMMContract.methods.approve(BuyMyRoomContract.options.address, maxUint).send({from: account});
                if (buyTokenId !== undefined) {
                    await BuyMyRoomContract.methods.BuyRoom(buyTokenId).send({from: account});
                } else {
                    message.error("no buyTokenId value");
                }
            } catch (error) {
                // @ts-ignore
                message.error(`error when buying room: ${error.message}`);
            }
        } else {
            alert("no BuyMyRoomContract or SimpleAMMContract");
        }
    }

    const [allRoomList, setAllRoomList] = useState<FullRoom[]>([]);
    const getAllRooms = async () => {
        if (BuyMyRoomContract) {
            try {
                const tokenIds: number[] = await BuyMyRoomContract.methods.GetListedRooms().call();
                const rooms = await Promise.all(
                    tokenIds.map(async (tokenId) => {
                        const room: Room = await BuyMyRoomContract.methods.Rooms(tokenId).call();
                        const f_room: FullRoom = {
                            tokenId: tokenId,
                            owner: room.owner,
                            price: room.price,
                            onListTimestamp: room.onListTimestamp,
                            onList: room.onList
                        };
                        return f_room;
                    })
                );
                setAllRoomList(rooms);
            } catch (error) {
                // @ts-ignore
                message.error(`error when fetching allRoomList: ${error.message}`);
            }
        } else {
            alert("no BuyMyRoomContract");
        }
    }

    const [myRoomList, setMyRoomList] = useState<FullRoom[]>([]);
    const getMyRooms = async () => {
        if (BuyMyRoomContract) {
            try {
                const tokenIds: number[] = await BuyMyRoomContract.methods.GetMyRooms().call({from: account});
                const rooms = await Promise.all(
                    tokenIds.map(async (tokenId) => {
                        const room: Room = await BuyMyRoomContract.methods.Rooms(tokenId).call();
                        console.log(room);
                        const f_room: FullRoom = {
                            tokenId: tokenId,
                            owner: room.owner,
                            price: room.price,
                            onListTimestamp: room.onListTimestamp,
                            onList: room.onList
                        };
                        return f_room;
                    })
                );
                setMyRoomList(rooms);
                console.log(myRoomList);
            } catch (error) {
                // @ts-ignore
                message.error(`error when getting my room: ${error.message}`);
            }
        } else {
            alert("no BuyMyRoomContract");
        }
    }

    const [toTokenNum, setToTokenNum] = useState<number>();
    const toToken = async () => {
        if (SimpleAMMContract) {
            try {
                console.log(toTokenNum);
                if (toTokenNum !== undefined) {
                    if (toTokenNum < 0.001 || toTokenNum > 50)
                        message.error("wrong ethers number you are using!");
                    const __num = web3.utils.toWei(toTokenNum, "ether");
                    await SimpleAMMContract.methods.toToken().send({from: account, value: __num});
                } else {
                    message.error("no toTokenNum value");
                }
            } catch (error) {
                // @ts-ignore
                message.error(`error when transforming to token: ${error.message}`);
            }
        } else {
            alert("no SimpleAMMContract");
        }
    }

    const [toEtherNum, setToEtherNum] = useState<number>();
    const toEther = async () => {
        if (SimpleAMMContract) {
            try {
                console.log(toEtherNum);
                if (toEtherNum != undefined) {
                    if (toEtherNum < 0.001 || toEtherNum > 50)
                        message.error("wrong credits number you are using!");
                    const __num = web3.utils.toWei(toEtherNum, "ether");
                    await SimpleAMMContract.methods.toEther(__num).send({from: account});
                }
            } catch (error) {
                // @ts-ignore
                message.error(`error when transforming to ether: ${error.message}`);
            }
        } else {
            alert("no SimpleAMMContract");
        }
    }

    const [newBlockOwner, setNewBlockOwner] = useState<string>();
    const changeBlockOnwer = async () => {
        if (BuyMyRoomContract) {
            try {
                BuyMyRoomContract.methods.ChangeBlockOwner(newBlockOwner).send({from: account});
            } catch (error) {
                // @ts-ignore
                message.error(`error when getting balance: ${error.message}`);
            }
        } else {
            alert("no BuyMyRoomContract");
        }
    }

    const [restCredit, setRestCredit] = useState<string>();
    const refreshBalance = async () => {
        if (SimpleAMMContract) {
            const num: number = await SimpleAMMContract.methods.restCredit().call();
            console.log(num);
            setRestCredit(web3.utils.fromWei(num, "ether"));
            console.log(restCredit);
        } else {
            alert("no SimpleAMMContract");
        }
    }

    // 使用useEffect钩子在组件挂载后获取数据
    useEffect(() => {
        // 定义一个异步函数来获取数据
        const fetchData = async () => {
            try {
                setAccount(location.state?.account || '');
                // await getAllRooms();
                // await getMyRooms();
            } catch (error) {
                console.error('Fetching account failed:', error);
            }
        };

        // 调用异步函数
        fetchData();
    }, []); // 空依赖数组确保只在组件挂载时运行

    // 渲染列表数据
    return (
        <div className="main-container">
            <div className="top-nav">
                <div>rest credits are:</div>
                <input readOnly value={restCredit}></input>
                &nbsp;&nbsp;
                <Button type='primary' onClick={refreshBalance}> refresh! </Button>
                &nbsp;&nbsp;||&nbsp;&nbsp;
                <Button type="primary" onClick={onLogout}> logout! </Button>
            </div>
            <div className="list-container">
                <h2>all my rooms</h2>
                <div className="list-items">
                    {myRoomList.map((item, index) => (
                        <div key={index} className="list-item">
                            <h3>tokenId: {item.tokenId.toString()}</h3>
                            <p>onListTime: {new Date(Number(item.onListTimestamp) * 1000).toLocaleString()}</p>
                            <p>price: {web3.utils.fromWei(item.price, "ether")} credits</p>
                            <p>onList: {item.onList.toString()}</p>
                        </div>
                    ))}
                </div>
                <Button type="primary" onClick={getMyRooms}> get my rooms </Button>
            </div>
            <div className="list-container">
                <h2>all on-list rooms</h2>
                <div className="list-items">
                    {allRoomList.map((item, index) => (
                        <div key={index} className="list-item">
                            <h3>tokenId: {item.tokenId.toString()}</h3>
                            <p>onListTime: {new Date(Number(item.onListTimestamp) * 1000).toLocaleString()}</p>
                            <p>price: {web3.utils.fromWei(item.price, "ether")} credits</p>
                            <p>owner: {item.owner.toString()}</p>
                        </div>
                    ))}
                </div>
                <Button type="primary" onClick={getAllRooms}> fresh all lists </Button>
            </div>
            <Card className="card-container">
                <div>build room for (only available for root account):</div>
                account address:&nbsp;
                <input onChange={(e) => setNewRoomOwner(e.target.value)}/>
                &nbsp;&nbsp;
                <Button type='primary' onClick={buildRoom}> build! </Button>
            </Card>
            <br/>
            <Card className="card-container">
                <div>list room:</div>
                tokenId:&nbsp;
                <input onChange={(e) => setListTokenId(Number(e.target.value))}/>
                &nbsp;&nbsp;price (in credit, equals to ether = 10^18 wei)&nbsp;
                <input onChange={(e) => setListPrice(Number(e.target.value))}/>
                &nbsp;&nbsp;
                <Button type='primary' onClick={listRoom}> list! </Button>
            </Card>
            <br/>
            <Card className="card-container">
                <div>unlist room:</div>
                tokenId:&nbsp;
                <input onChange={(e) => setUnlistTokenId(Number(e.target.value))}/>
                &nbsp;&nbsp;
                <Button type='primary' onClick={unlistRoom}> unlist! </Button>
            </Card>
            <br/>
            <Card className="card-container">
                <div>buy room:</div>
                tokenId:&nbsp;
                <input onChange={(e) => setBuyTokenId(Number(e.target.value))}/>
                &nbsp;&nbsp;
                <Button type='primary' onClick={buyRoom}> buy room! </Button>
            </Card>
            <br/>
            <Card className="card-container">
                <div>to token, input how many ether ( = 10^18 wei ) you'd like to pay: ( 1 Ether = 1 credit )</div>
                ethers:&nbsp;
                <input onChange={(e) => setToTokenNum(Number(e.target.value))}/>
                &nbsp;&nbsp;
                <Button type='primary' onClick={toToken}> toToken! </Button>
            </Card>
            <br/>
            <Card className="card-container">
                <div>to ether, input how many tokens you'd like to pay: (1 Ether = 1 credit)</div>
                tokens:&nbsp;
                <input onChange={(e) => setToEtherNum(Number(e.target.value))}/>
                &nbsp;&nbsp;
                <Button type='primary' onClick={toEther}> toEther! </Button>
            </Card>
            <br/>
            <Card className="card-container">
                <div>change the root block's owner, new owner will be:</div>
                <input onChange={(e) => setNewBlockOwner(e.target.value)}/>
                &nbsp;&nbsp;
                <Button type='primary' onClick={changeBlockOnwer}> change! </Button>
            </Card>
        </div>
    );
};

export default MainPage;