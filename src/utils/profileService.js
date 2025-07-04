import { supabase } from "../supabaseClient";

export async function checkUserLoggedIn() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("User is not logged in");
  }
}

export async function fetchUserProfiles() {
  const { data, error } = await supabase.from("profiles").select("*");
  if (error) throw error;
  return data;
}

export async function updateProfile(id, formData) {
  console.log(formData);

  const { error } = await supabase
    .from("profiles")
    .update({
      name: formData.name,
      balance: parseFloat(formData.balance),
      imageUrl: formData.imageUrl,
    })
    .eq("id", id);
  if (error) throw error;
  console.log('update successful');
}

export async function submitTransaction(
  profile,
  transactionType,
  transactionData
) {
  const multiplier = transactionType === "withdraw" ? -1 : 1;
  const adjustment = multiplier * parseFloat(transactionData.amount);

  const { data: transaction, error: insertError } = await supabase
    .from("transactions")
    .insert([
      { adjustment, note: transactionData.note, profile_id: profile.id },
    ])
    .select()
    .single();
  if (insertError) throw insertError;

  const { error: joinError } = await supabase
    .from("transaction_join")
    .insert([{ profile_id: profile.id, transaction_id: transaction.id }]);
  if (joinError) throw joinError;

  const newBalance = (parseFloat(profile.balance) || 0) + adjustment;
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ balance: newBalance })
    .eq("id", profile.id);
  if (updateError) throw updateError;

  return newBalance;
}

export async function fetchTransactionHistory(profileId) {
  const { data, error } = await supabase
    .from("transactions")
    .select("id, adjustment, note, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
