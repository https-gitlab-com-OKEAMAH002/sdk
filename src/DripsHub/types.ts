import type { ReceivableDrips } from 'src/common/types';

export type DripsState = {
	/** The current drips receivers list hash. */
	dripsHash: string;
	/** The current drips history hash. */
	dripsHistoryHash: string;
	/** The time when drips have been configured for the last time. */
	updateTime: number;
	/** The balance when drips have been configured for the last time. */
	balance: bigint;
	/** The current maximum end time of drips. */
	maxEnd: number;
};

export type DripsHubClientConstants = {
	MAX_TOTAL_BALANCE: bigint;
	TOTAL_SPLITS_WEIGHT: number;
	MAX_DRIPS_RECEIVERS: number;
	MAX_SPLITS_RECEIVERS: number;
	AMT_PER_SEC_MULTIPLIER: bigint;
	AMT_PER_SEC_EXTRA_DECIMALS: number;
};

export type ReceivableTokenBalance = {
	tokenAddress: string;
	receivableDrips: ReceivableDrips;
};
