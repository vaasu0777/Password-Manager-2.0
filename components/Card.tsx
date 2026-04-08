"use client"
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card"
import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { RootState } from "@/lib/store";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { setCards } from "@/lib/features/cardSlice";
import { Pencil, Trash2 } from "lucide-react";

function luhnCheck(cardNumber: string): boolean {
  let sum = 0;
  let shouldDouble = false;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => String(currentYear + i));

const formSchema = z.object({
  cardholderName: z
    .string()
    .min(2, { message: "Cardholder name must be at least 2 characters" })
    .max(50, { message: "Cardholder name is too long" })
    .regex(/^[a-zA-Z\s'-]+$/, {
      message: "Name can only contain letters, spaces, hyphens, and apostrophes",
    }),

  cardNumber: z
    .string()
    .min(1, { message: "Card number is required" })
    .transform((val) => val.replace(/\s/g, ""))
    .refine((val) => /^\d{16}$/.test(val), {
      message: "Card number must be exactly 16 digits",
    })
    .refine((val) => luhnCheck(val), {
      message: "Invalid card number",
    }),

  month: z.string().min(1, { message: "Month is required" }),
  year: z.string().min(1, { message: "Year is required" }),

  cvv: z
    .string()
    .min(1, { message: "CVV is required" })
    .refine((val) => /^\d{3,4}$/.test(val), {
      message: "CVV must be 3 or 4 digits",
    })
    .max(5, { message: "CVV can't be more than 5 digits" }),

  comments: z.string().optional(),
})
  .refine(
    (data) => {
      if (!data.month || !data.year) return true;
      const expiry = new Date(parseInt(data.year), parseInt(data.month) - 1, 1);
      const today = new Date();
      today.setDate(1);
      return expiry >= today;
    },
    { message: "Card has expired", path: ["month"] }
  );

type FormValues = z.infer<typeof formSchema>;

const CardManager = () => {
  const { getToken, userId } = useAuth();
  const toastObj = useSelector((state: any) => state.toast.toastObj);
  const darkMode = useSelector((state: RootState) => state.theme.darkMode);
  const cards = useSelector((state: RootState) => state.cards.cards);
  const dispatch = useDispatch();

  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardholderName: "",
      cardNumber: "",
      month: "",
      year: "",
      cvv: "",
      comments: "",
    },
  });

  const { register, handleSubmit, control, reset, setValue, formState: { errors, isSubmitting } } = form;

  async function getDetails() {
    try {
      const token = await getToken();
      if (!token) return;

      const req = await fetch(`http://localhost:8080/cards`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!req.ok) {
        console.error("Failed to fetch cards:", req.status, await req.text());
        return;
      }

      const res = await req.json();
      dispatch(setCards(res));
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  useEffect(() => {
    if (userId) {
      getDetails();
    }
  }, [userId]);

  async function submitCard(data: FormValues) {
    try {
      const token = await getToken();
      if (!token) {
        toast.error("Not authenticated", toastObj);
        return;
      }

      const payload = {
        cardHolderName: data.cardholderName,
        CardNumber: data.cardNumber,
        ExpiryDate: `${data.month}/${data.year}`,
        CVV: data.cvv,
        Comments: data.comments,
      };

      if (editingId) {
        // --- EDIT ---
        const res = await fetch(`http://localhost:8080/cards`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ _id: editingId, ...payload }),
        });

        if (!res.ok) {
          toast.error("Failed to update card", toastObj);
          return;
        }

        dispatch(setCards(cards.map((c: any) =>
          c._id === editingId ? { ...c, ...payload } : c
        )));

        setEditingId(null);
        reset();
        toast.success("Card updated successfully!", toastObj);
      } else {
        // --- ADD NEW ---
        const res = await fetch(`http://localhost:8080/cards`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          toast.error("Failed to save card", toastObj);
          return;
        }

        dispatch(setCards([...cards, payload]));
        reset();
        toast.success("Card details saved successfully", toastObj);
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Something went wrong", toastObj);
    }
  }

  function handleEdit(item: any) {
    const [month, year] = item.ExpiryDate?.split("/") ?? ["", ""];
    setValue("cardholderName", item.cardHolderName ?? "");
    setValue("cardNumber", String(item.CardNumber));
    setValue("month", month);
    setValue("year", year);
    setValue("cvv", String(item.CVV));
    setValue("comments", item.Comments ?? "");
    setEditingId(item._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    const c = confirm("Do you really want to delete this card?");
    if (!c) return;

    const token = await getToken();
    await fetch("http://localhost:8080/cards", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ _id: id }),
    });

    dispatch(setCards(cards.filter((c: any) => c._id !== id)));
    toast.success("Card deleted successfully!", toastObj);
  }

  return (
    <div className="flex flex-col items-center w-full px-3 sm:px-6 py-4">

      {/* Form card */}
      <div className={`w-full max-w-xs sm:max-w-md md:max-w-2xl flex rounded-2xl flex-col
      ${darkMode ? "shadow-[#29bf1f]" : "shadow-black"} z-10 my-2 shadow-2xl p-5 sm:p-8`}>

        <h2 className="text-2xl sm:text-3xl text-purple-800 text-center w-text">
          {editingId ? "Edit Card" : "Add new Card"}
        </h2>

        <Card className="mt-4 flex flex-col px-9 sm:px-7">
          <div className="w-full mt-2">
            <form onSubmit={handleSubmit(submitCard)}>
              <FieldGroup>
                <FieldSet>
                  <FieldGroup>

                    {/* Name on Card */}
                    <Field>
                      <FieldLabel htmlFor="card-name">
                        <p className="text-lg sm:text-base w-text">Name on Card</p>
                      </FieldLabel>
                      <Input
                        id="card-name"
                        placeholder="Evil Rabbit"
                        className="text-sm sm:text-base"
                        {...register("cardholderName")}
                      />
                      {errors.cardholderName && (
                        <p className="text-red-500 text-xs mt-1">{errors.cardholderName.message}</p>
                      )}
                    </Field>

                    {/* Card Number */}
                    <Field>
                      <FieldLabel htmlFor="card-number">
                        <p className="text-sm sm:text-base w-text">Card Number</p>
                      </FieldLabel>
                      <Input
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                        className="text-sm sm:text-base"
                        {...register("cardNumber")}
                      />
                      <FieldDescription className="text-xs sm:text-sm">
                        Enter your 16-digit card number
                      </FieldDescription>
                      {errors.cardNumber && (
                        <p className="text-red-500 text-xs mt-1 w-text">{errors.cardNumber.message}</p>
                      )}
                    </Field>

                    {/* Month / Year / CVV */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      <Field>
                        <FieldLabel htmlFor="exp-month">
                          <p className="text-sm sm:text-base w-text">Month</p>
                        </FieldLabel>
                        <Controller
                          name="month"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger id="exp-month" className="text-sm">
                                <SelectValue placeholder="MM" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {["01","02","03","04","05","06","07","08","09","10","11","12"].map((m) => (
                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.month && (
                          <p className="text-red-500 text-xs mt-1 w-text">{errors.month.message}</p>
                        )}
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="exp-year">
                          <p className="text-sm sm:text-base w-text">Year</p>
                        </FieldLabel>
                        <Controller
                          name="year"
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger id="exp-year" className="text-sm">
                                <SelectValue placeholder="YYYY" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {years.map((y) => (
                                    <SelectItem key={y} value={y}>{y}</SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.year && (
                          <p className="text-red-500 text-xs mt-1">{errors.year.message}</p>
                        )}
                      </Field>

                      <Field className="col-span-2 sm:col-span-1">
                        <FieldLabel htmlFor="cvv">
                          <p className="text-sm sm:text-base w-text">CVV</p>
                        </FieldLabel>
                        <Input
                          id="cvv"
                          placeholder="123"
                          maxLength={4}
                          className="text-sm sm:text-base"
                          {...register("cvv")}
                        />
                        {errors.cvv && (
                          <p className="text-red-500 text-xs mt-1">{errors.cvv.message}</p>
                        )}
                      </Field>
                    </div>

                  </FieldGroup>
                </FieldSet>

                <FieldSeparator />

                <FieldSet>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="comments">
                        <p className="text-base sm:text-xl w-text">Comments</p>
                      </FieldLabel>
                      <Textarea
                        id="comments"
                        placeholder="Add any additional comments"
                        className="resize-none text-sm sm:text-base"
                        {...register("comments")}
                      />
                    </Field>
                  </FieldGroup>
                </FieldSet>

                <Field orientation="horizontal">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="cursor-pointer rounded-full px-4 w-text text-sm sm:text-base"
                  >
                    {isSubmitting ? "Saving..." : editingId ? "Update" : "Submit"}
                  </Button>
                  <Button
                    className="cursor-pointer rounded-full px-4 w-text text-sm sm:text-base"
                    variant="outline"
                    type="button"
                    onClick={() => { reset(); setEditingId(null); }}
                  >
                    {editingId ? "Cancel" : "Reset"}
                  </Button>
                </Field>

              </FieldGroup>
            </form>
          </div>
        </Card>
      </div>

      {/* Cards list heading */}
      <h2 className="text-2xl sm:text-3xl md:text-4xl w-text text-center mt-6 mb-4">Your cards</h2>

      {/* Cards list */}
      <div className={`w-full max-w-xs sm:max-w-md md:max-w-2xl z-20 shadow-2xl p-3 sm:p-4 rounded-3xl
      ${darkMode ? "shadow-[#29bf1f]" : "shadow-black"}`}>

        {cards.length === 0 && (
          <p className="text-center px-4 py-6 text-sm sm:text-base opacity-60">No cards to show</p>
        )}

        {cards.length !== 0 && (
          <div>
            <h3 className="ml-2 sm:ml-5 mb-3 text-lg w-text font-semibold">Your Cards 💳💳</h3>
            <div className="p-2 sm:p-3 space-y-3">
              {cards.map((item: any, index: number) => (
                <div
                  key={index}
                  className="bg-slate-500 flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-3 rounded-2xl w-full"
                >
                  {/* Card info */}
                  <div className="flex flex-col gap-1">
                    <p className="text-sm w-text sm:text-base font-mono tracking-wider">
                      **** **** **** {String(item.CardNumber).slice(-4)}
                    </p>
                    <p className="text-xs w-text sm:text-sm opacity-80">{item.ExpiryDate}</p>
                  </div>

                  {/* Edit + Delete icons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 rounded-full cursor-pointer hover:bg-white/20 transition-colors"
                      title="Edit card"
                    >
                      <Pencil size={16} className="text-white" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 rounded-full cursor-pointer hover:bg-red-500/40 transition-colors"
                      title="Delete card"
                    >
                      <Trash2 size={16} className="text-red-300" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardManager;