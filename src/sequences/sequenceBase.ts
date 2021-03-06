import { CreateGeneratorResult, CreateSampleGeneratorResult, EnsureAllParametersAreSetResult, isSequenceErrorMessage } from "./sequenceTypes";

export abstract class ASequenceBase {
	public abstract get name(): string;

	public async ensureAllParametersAreSet(): Promise<EnsureAllParametersAreSetResult> {
		return true;
	};

	public async createGenerator(): Promise<CreateGeneratorResult> {
		const ensureResult = await this.ensureAllParametersAreSet();
		if (isSequenceErrorMessage(ensureResult)) {
			return ensureResult;
		}

		return await this.createGeneratorInternal();
	}
	public abstract createGeneratorInternal(): Promise<CreateGeneratorResult>;

	public async createSampleGenerator(): Promise<CreateSampleGeneratorResult> {
		return null;
	}

	public async getSample(): Promise<string> {
		let generator = await this.createSampleGenerator();
		if (generator === null) {
			generator = await this.createGenerator();
		}

		if (isSequenceErrorMessage(generator)) {
			return `Generator returned an error: ${generator.errorMessage}`;
		}

		const iterator = generator();

		const sampleItems: string[] = [];

		let i = 0;
		let hasMoreItems = true;
		while (i < 5) {
			const nextItem = iterator.next();
			if (nextItem.done) {
				hasMoreItems = false;
				break;
			}

			sampleItems.push(nextItem.value);
			i++;
		}

		if (sampleItems.length === 0) {
			return "No samples available for this series – configuration may be invalid.";
		}

		const moreItemsAvailable = hasMoreItems ? "…" : "";
		return `Sample: ${sampleItems.join(", ")}${moreItemsAvailable}`;
	}
}
