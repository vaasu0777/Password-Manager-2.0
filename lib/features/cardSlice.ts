// store/cardSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CardType {
  cardHolderName: string,
  CardNumber: string;
  ExpiryDate: string; // MM/YY
  CVV: string;
}

interface CardState {
  cards: CardType[];
  editCardId: string | null;
}

const initialState: CardState = {
  cards: [],
  editCardId: null,
};

const cardSlice = createSlice({
  name: "cards",
  initialState,
  reducers: {
    // ➕ Add Card
    addCard: (state, action: PayloadAction<CardType>) => {
      state.cards.push(action.payload);
    },

    // 📥 Set all cards (from DB)
    setCards: (state, action: PayloadAction<CardType[]>) => {
      state.cards = action.payload;
    },

    // ✏️ Start Editing
    setEditCard: (state, action: PayloadAction<string | null>) => {
      state.editCardId = action.payload;
    },

    // // 🔄 Update Card
    // updateCard: (state, action: PayloadAction<CardType>) => {
    //   const index = state.cards.findIndex(
    //     (card) => card._id === action.payload._id
    //   );
    //   if (index !== -1) {
    //     state.cards[index] = action.payload;
    //   }
    // },

    // // ❌ Delete Card
    // deleteCard: (state, action: PayloadAction<string>) => {
    //   state.cards = state.cards.filter(
    //     (card) => card._id !== action.payload
    //   );
    // },

    // 🧹 Clear all
    clearCards: (state) => {
      state.cards = [];
    },
  },
});

export const {
  addCard,
  setCards,
  setEditCard,
  clearCards,
} = cardSlice.actions;

export default cardSlice.reducer;