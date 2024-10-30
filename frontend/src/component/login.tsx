import React, { useState, useEffect } from 'react';
import { Button, Select, message, Card } from 'antd';
import {useLocation, useNavigate} from "react-router-dom";
import { web3 } from '../utils/contract';
import Title from "antd/es/typography/Title";

const { Option } = Select;

const LoginPage: React.FC = () => {
    const [accounts, setAccounts] = useState<string[]>([]);
    const [account, setAccount] = useState<string>();
    const navigate = useNavigate();
    const GanacheTestChainId = '0x539';
    const GanacheTestChainName = 'Ganache Test Chain'
    const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545';

    // 处理账户切换
    const onAccountsChanged = async (newAccounts: string[]) => {
        if (newAccounts.length > 0) {
            setAccounts(newAccounts);
            setAccount(newAccounts[0]);
            message.info(`new account is: ${newAccounts[0]}`);
        } else {
            message.error('no accounts found，try connect to MetaMask');
        }
    };

    const connectToGanache = async () => {
        // @ts-ignore
        const { ethereum } = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            message.error('no MetaMask');
            return;
        }

        try {
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId,
                    chainName: GanacheTestChainName,
                    rpcUrls: [GanacheTestChainRpcUrl],
                };

                try {
                    await ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: GanacheTestChainId }],
                    });
                } catch (switchError: any) {
                    if (switchError.code === 4902) {
                        await ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [chain],
                        });
                    }
                }
            }

            await ethereum.request({ method: 'eth_requestAccounts' });
            message.success('connect to Ganache');
        } catch (error: any) {
            message.error(`failed to connect to Ganache: ${error.message}`);
        }
    };

    const loadAccounts = async () => {
        const allAccounts = await web3.eth.getAccounts();
        if (allAccounts.length > 0) {
            setAccounts(allAccounts);
            setAccount(allAccounts[0]);
        }
    };

    useEffect(() => {
        const init = async () => {
            await connectToGanache();
            await loadAccounts();
        };

        init();

        // @ts-ignore
        if (window.ethereum) {
            // @ts-ignore
            window.ethereum.on('accountsChanged', onAccountsChanged);
        }

        return () => {
            // @ts-ignore
            if (window.ethereum) {
                // @ts-ignore
                window.ethereum.removeListener('accountsChanged', onAccountsChanged);
            }
        };
    }, []);

    // 登录后跳转到主页面
    const onLogin = async () => {
        if (account) {
            message.success(`login as: ${account}`);
            navigate('/main', { state: { account } });
        } else {
            message.error('no login account found');
        }
    };

    return (
        <div className="login-container">
            {/* 添加页面标题 */}
            <Title level={1} className="page-title">
                my room buyer
            </Title>

            {/* 登录表单卡片 */}
            <Card className="login-card" title="login to DApp" bordered={false}>
                <p>login as: {account ? account : 'no account found'}</p>

                <Select
                    style={{ width: 300, marginBottom: 20 }}
                    onChange={(value: string) => setAccount(value)}
                    value={account}
                >
                    {accounts.map(acc => (
                        <Option key={acc} value={acc}>
                            {acc}
                        </Option>
                    ))}
                </Select>

                <Button type="primary" onClick={onLogin}>
                    login!
                </Button>
            </Card>
        </div>
    );
};

export default LoginPage;

