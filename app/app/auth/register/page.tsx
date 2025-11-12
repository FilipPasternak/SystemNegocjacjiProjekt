"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/zod";
import { apiFetch } from "@/lib/api";

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow">
      <h1 className="text-xl font-semibold mb-4">Register</h1>
      <form
        onSubmit={handleSubmit(async (values: any) => {
          await apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(values) });
          alert("Registered. Now login.");
          window.location.href = "/auth/login";
        })}
        className="space-y-3"
      >
        <input placeholder="Email" className="w-full border p-2 rounded" {...register("email")} />
        {errors.email && <p className="text-red-600 text-sm">{`${errors.email.message}`}</p>}
        <input type="password" placeholder="Password" className="w-full border p-2 rounded" {...register("password")} />
        {errors.password && <p className="text-red-600 text-sm">{`${errors.password.message}`}</p>}
        <select className="w-full border p-2 rounded" {...register("role")}>
          <option value="PRODUCER">PRODUCER</option>
          <option value="BUYER">BUYER</option>
        </select>
        <button disabled={isSubmitting} className="bg-black text-white px-4 py-2 rounded">
          {isSubmitting ? "..." : "Create account"}
        </button>
      </form>
    </div>
  );
}
