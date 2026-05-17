import {
    FlashcardCardPreview,
    FlashcardCurrentPreview,
    FlashcardRepeatPolicy,
    FlashcardRepeatPolicyRule,
    FlashcardReviewOptionPreview,
} from "../types/flashcardPreview";

export function calculateRepeatAfterCards(
    remainingCards: number,
    policy: FlashcardRepeatPolicyRule
): number {
    if (remainingCards <= 0) {
        return 0;
    }

    const raw = Math.round(remainingCards * policy.ratio);
    const clamped = Math.max(policy.min, Math.min(policy.max, raw));

    return Math.min(clamped, remainingCards);
}

export function formatIntervalDays(days: number): string {
    return `${days} ngày`;
}

export function formatRepeatAfterCards(cards: number): string {
    if (cards === 0) {
        return "Lặp lại ngay";
    }

    return `Lặp lại sau ${cards} thẻ`;
}

function buildIntervalPreview(option: FlashcardReviewOptionPreview): string {
    return formatIntervalDays(option.interval_days ?? 0);
}

function resolveRepeatAfterCards(
    option: FlashcardReviewOptionPreview,
    repeatPolicy: FlashcardRepeatPolicy,
    remainingCards: number
): number | undefined {
    if (!option.repeat_policy_key) {
        return undefined;
    }

    return calculateRepeatAfterCards(remainingCards, repeatPolicy[option.repeat_policy_key]);
}

function buildRepeatPreview(
    option: FlashcardReviewOptionPreview,
    repeatPolicy: FlashcardRepeatPolicy,
    remainingCards: number
): string {
    return formatRepeatAfterCards(
        resolveRepeatAfterCards(option, repeatPolicy, remainingCards) ?? 0
    );
}

export function buildCurrentFlashcardPreview(input: {
    cardPreview: FlashcardCardPreview;
    repeatPolicy: FlashcardRepeatPolicy;
    remainingCards: number;
}): FlashcardCurrentPreview {
    const { cardPreview, repeatPolicy, remainingCards } = input;

    if (cardPreview.card_type === "NEW") {
        const vagueRepeatAfterCards = resolveRepeatAfterCards(
            cardPreview.options.vague,
            repeatPolicy,
            remainingCards
        );
        const unknownRepeatAfterCards = resolveRepeatAfterCards(
            cardPreview.options.unknown,
            repeatPolicy,
            remainingCards
        );

        return {
            card_type: "NEW",
            options: [
                {
                    key: "remember",
                    label: "Đã nhớ",
                    preview: buildIntervalPreview(cardPreview.options.remember),
                },
                {
                    key: "vague",
                    label: "Mơ hồ",
                    preview: buildRepeatPreview(
                        cardPreview.options.vague,
                        repeatPolicy,
                        remainingCards
                    ),
                    repeat_after_cards: vagueRepeatAfterCards,
                },
                {
                    key: "unknown",
                    label: "Chưa biết",
                    preview: buildRepeatPreview(
                        cardPreview.options.unknown,
                        repeatPolicy,
                        remainingCards
                    ),
                    repeat_after_cards: unknownRepeatAfterCards,
                },
            ],
        };
    }

    const vagueRepeatAfterCards = resolveRepeatAfterCards(
        cardPreview.options.vague,
        repeatPolicy,
        remainingCards
    );
    const forgotRepeatAfterCards = resolveRepeatAfterCards(
        cardPreview.options.forgot,
        repeatPolicy,
        remainingCards
    );
    const vagueRepeatPreview = buildRepeatPreview(
        cardPreview.options.vague,
        repeatPolicy,
        remainingCards
    );
    const forgotRepeatPreview = buildRepeatPreview(
        cardPreview.options.forgot,
        repeatPolicy,
        remainingCards
    );

    return {
        card_type: "REVIEW",
        options: [
            {
                key: "remember",
                label: "Đã nhớ",
                preview: buildIntervalPreview(cardPreview.options.remember),
            },
            {
                key: "vague",
                label: "Mơ hồ",
                preview: `${buildIntervalPreview(cardPreview.options.vague)} · ${vagueRepeatPreview}`,
                repeat_after_cards: vagueRepeatAfterCards,
            },
            {
                key: "forgot",
                label: "Quên",
                preview: `${buildIntervalPreview(cardPreview.options.forgot)} · ${forgotRepeatPreview}`,
                repeat_after_cards: forgotRepeatAfterCards,
            },
        ],
    };
}
