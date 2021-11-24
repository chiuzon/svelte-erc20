<script lang="ts">
import { ethers } from "ethers";
import svelteERC20 from "$lib/svelteERC20";

const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com")
let ercAddress;
let erc20Bal

const {contract, init: initToken0, symbol, balanceOf, decimals} = svelteERC20()

$: ethers.utils.isAddress(ercAddress) && (() => {
    initToken0(ercAddress, provider)

    erc20Bal = balanceOf("0xc2132D05D31c914a87C6611C10748AEb04B58e8F")
})()

$: $contract && $decimals.then((res) => {
    console.log(res)
})

</script>

<input type="text" bind:value={ercAddress} placeholder="erc20 address" >

{#if $contract}
    {#await $symbol}
        ...
    {:then symbol} 
        {symbol}
    {/await}

    {#await $erc20Bal then bal}
        {bal.toString()}
    {/await}

    {#await $decimals then decimals}
        {decimals.toString()}
    {/await}
{/if}

