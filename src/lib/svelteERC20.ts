import { derived, get, readable, writable } from "svelte/store";
import { ethers } from "ethers"

const ERC20_ABI = [
    "function name() public view returns (string)",
    "function symbol() public view returns (string)",
    "function decimals() public view returns (uint8)",
    "function totalSupply() public view returns (uint256)",
    "function balanceOf(address _owner) public view returns (uint256 balance)",
    "function transfer(address _to, uint256 _value) public returns (bool success)",
    "function transferFrom(address _from, address _to, uint256 _value) public returns (bool success)",
    "function approve(address _spender, uint256 _value) public returns (bool success)",
    "function allowance(address _owner, address _spender) public view returns (uint256 remaining)",
    
    "event Transfer(address _from, address _to, uint256 _value)",
    "event Approval(address _owner, address _spender, uint256 _value)"
]


// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function svelteERC20() {
    const refresh = writable(0)
    const erc20Contract = writable<ethers.Contract>(null)
    
    function init(
        address: string,
        providerOrSigner: ethers.providers.Provider | ethers.Signer
    ) {
        if(address.length <= 0){
            throw Error("!Address")
        }

        erc20Contract.set(new ethers.Contract(address, ERC20_ABI, providerOrSigner))
    }

    const transferEvent = readable([], (set) => {
        const eventHandle = (from, to, value) => {
            set([from, to, value])
        }   

        get(erc20Contract).on("Transfer", eventHandle)
        
        return () => {
            get(erc20Contract).off("Transfer", eventHandle)
        }
    })

    const approvalEvent = readable(null, (set) => {
        const eventHandle = (owner, spender, value) => {
            set([owner, spender, value])
        }   

        get(erc20Contract).on("Approval", eventHandle)
        
        return () => {
            get(erc20Contract).off("Approval", eventHandle)
        }
    })

    const name = derived([erc20Contract], async ([$contract]) => {
        const name = await $contract.name()
        return name
    })

    const symbol = derived([erc20Contract], async ([$contract]) => {
        const symbol = await $contract.symbol()

        console.log(symbol)

        return symbol
    })

    const decimals = derived([erc20Contract], async ([$contract]) => {
        const decimals = await $contract.decimals()
        return decimals
    })

    const totalSupply = derived([erc20Contract], async ([$contract]) => {
        const totalSupply = await $contract.totalSupply()
        return totalSupply
    })

    function allowance(owner: string, spender: string) {
        return derived([erc20Contract, refresh], async ([$contract]) => {
            const allowance = await $contract.allowance(owner, spender)
            return allowance
        })
    }

    function balanceOf(owner: string) {
        return derived([erc20Contract, refresh], async ([$contract]) => {
            const balance = await $contract.balanceOf(owner)
            return balance
        })
    }

    async function transfer(to: string, value: ethers.BigNumber) {
        if(to.length <= 0){
            throw Error("!Address")
        }

        try {
            const _contract = get(erc20Contract)

            const transferTX = await _contract.transfer(to, value);

            await transferTX.wait()

            refresh.update((val) => val++)

            return transferTX
        } catch(e) {
            throw typeof e
        }
    }

    async function transferFrom(from: string, to: string, value: ethers.BigNumber) {
        if(from.length <= 0 || to.length <= 0){
            throw Error("!Address")
        }

        try {
            const _contract = get(erc20Contract)

            const transferTX = await _contract.transferFrom(from, to, value);

            await transferTX.wait()

            refresh.update((val) => val++)

            return transferTX
        } catch(e) {
            throw typeof e
        }
    }

    async function approve(spender: string, value: ethers.BigNumber) {
        if(spender.length <= 0){
            throw Error("!Address")
        }

        try {
            const _contract = get(erc20Contract)

            const transferTX = await _contract.transferFrom(spender, value);

            await transferTX.wait()

            refresh.update((val) => val++)

            return transferTX
        } catch(e) {
            throw typeof e
        }
    }

    return {
        contract: erc20Contract,
        init,
        transferFrom,
        allowance,
        balanceOf,
        transfer,
        approve,
        name,
        symbol,
        decimals,
        totalSupply,
        transferEvent,
        approvalEvent,
    }
}

export default svelteERC20