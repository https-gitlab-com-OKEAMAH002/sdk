/* eslint-disable no-dupe-class-members */
import type { RepoDriver, DripsReceiverStruct, SplitsReceiverStruct, UserMetadataStruct } from 'contracts/RepoDriver';
import type { PromiseOrValue } from 'contracts/common';
import type { PopulatedTransaction, BigNumberish, Overrides, Signer, BytesLike } from 'ethers';
import { formatDripsReceivers, formatSplitReceivers, safeDripsTx } from '../common/internals';
import { RepoDriver__factory } from '../../contracts/factories';
import { validateClientSigner } from '../common/validators';
import Utils from '../utils';

export interface IRepoDriverTxFactory
	extends Pick<
		RepoDriver['populateTransaction'],
		'requestUpdateRepoOwner' | 'collect' | 'give' | 'setSplits' | 'setDrips' | 'emitUserMetadata'
	> {}

/**
 * A factory for creating `RepoDriver` contract transactions.
 */
export default class RepoDriverTxFactory implements IRepoDriverTxFactory {
	#signer!: Signer;
	#driver!: RepoDriver;
	#driverAddress!: string;

	public get driverAddress(): string {
		return this.#driverAddress;
	}

	public get signer(): Signer | undefined {
		return this.#signer;
	}

	// TODO: update supported networks.
	/**
	 * Creates a new immutable `RepoDriverTxFactory` instance.
	 *
	 * @param signer The signer that will be used to sign the generated transactions.
	 *
	 * The `singer` must be connected to a provider.
	 *
	 * The supported networks are:
	 * - 'goerli': chain ID `5`
	 * @param customDriverAddress Overrides the `RepoDriver` contract address.
	 * If it's `undefined` (default value), the address will be automatically selected based on the `signer.provider`'s network.
	 * @returns A `Promise` which resolves to the new client instance.
	 * @throws {@link DripsErrors.initializationError} if the initialization fails.
	 */
	public static async create(signer: Signer, customDriverAddress?: string): Promise<RepoDriverTxFactory> {
		await validateClientSigner(signer, Utils.Network.SUPPORTED_CHAINS);

		const { chainId } = await signer.provider!.getNetwork(); // If the validation passed we know that the signer is connected to a provider.

		const driverAddress = customDriverAddress || Utils.Network.configs[chainId].REPO_DRIVER;

		const client = new RepoDriverTxFactory();
		client.#signer = signer;
		client.#driverAddress = driverAddress;
		client.#driver = RepoDriver__factory.connect(driverAddress, signer);

		return client;
	}

	public async requestUpdateRepoOwner(
		forge: PromiseOrValue<BigNumberish>,
		name: PromiseOrValue<BytesLike>,
		overrides: Overrides & { from?: PromiseOrValue<string> } = {}
	): Promise<PopulatedTransaction> {
		return safeDripsTx(await this.#driver.populateTransaction.requestUpdateRepoOwner(forge, name, overrides));
	}

	public async collect(
		repoId: PromiseOrValue<BigNumberish>,
		erc20: PromiseOrValue<string>,
		transferTo: PromiseOrValue<string>,
		overrides: Overrides & { from?: PromiseOrValue<string> } = {}
	): Promise<PopulatedTransaction> {
		return safeDripsTx(await this.#driver.populateTransaction.collect(repoId, erc20, transferTo, overrides));
	}

	public async give(
		repoId: PromiseOrValue<BigNumberish>,
		receiver: PromiseOrValue<BigNumberish>,
		erc20: PromiseOrValue<string>,
		amt: PromiseOrValue<BigNumberish>,
		overrides: Overrides & { from?: PromiseOrValue<string> } = {}
	): Promise<PopulatedTransaction> {
		return safeDripsTx(await this.#driver.populateTransaction.give(repoId, receiver, erc20, amt, overrides));
	}

	public async setSplits(
		repoId: PromiseOrValue<BigNumberish>,
		receivers: SplitsReceiverStruct[],
		overrides: Overrides & { from?: PromiseOrValue<string> } = {}
	): Promise<PopulatedTransaction> {
		return safeDripsTx(
			await this.#driver.populateTransaction.setSplits(repoId, formatSplitReceivers(receivers), overrides)
		);
	}

	public async setDrips(
		repoId: PromiseOrValue<BigNumberish>,
		erc20: PromiseOrValue<string>,
		currReceivers: DripsReceiverStruct[],
		balanceDelta: PromiseOrValue<BigNumberish>,
		newReceivers: DripsReceiverStruct[],
		maxEndHint1: PromiseOrValue<BigNumberish>,
		maxEndHint2: PromiseOrValue<BigNumberish>,
		transferTo: PromiseOrValue<string>,
		overrides: Overrides & { from?: PromiseOrValue<string> } = {}
	): Promise<PopulatedTransaction> {
		if (!overrides.gasLimit) {
			const gasEstimation = await this.#driver.estimateGas.setDrips(
				repoId,
				erc20,
				formatDripsReceivers(currReceivers),
				balanceDelta,
				formatDripsReceivers(newReceivers),
				maxEndHint1,
				maxEndHint2,
				transferTo,
				overrides
			);

			const gasLimit = Math.ceil(gasEstimation.toNumber() * 1.2);
			// eslint-disable-next-line no-param-reassign
			overrides = { ...overrides, gasLimit };
		}

		return safeDripsTx(
			await this.#driver.populateTransaction.setDrips(
				repoId,
				erc20,
				formatDripsReceivers(currReceivers),
				balanceDelta,
				formatDripsReceivers(newReceivers),
				maxEndHint1,
				maxEndHint2,
				transferTo,
				overrides
			)
		);
	}

	public async emitUserMetadata(
		repoId: PromiseOrValue<BigNumberish>,
		userMetadata: UserMetadataStruct[],
		overrides: Overrides & { from?: PromiseOrValue<string> } = {}
	): Promise<PopulatedTransaction> {
		return safeDripsTx(await this.#driver.populateTransaction.emitUserMetadata(repoId, userMetadata, overrides));
	}
}
