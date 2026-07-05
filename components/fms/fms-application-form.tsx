"use client";

import { useRef, useState, useTransition } from "react";
import { submitFmsApplicationLeadAction } from "@/app/fms/apply/actions";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";

type FormState = {
  error: string;
  leadCode: string;
  message: string;
};

const initialState: FormState = {
  error: "",
  leadCode: "",
  message: "",
};

export function FmsApplicationForm() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, setState] = useState<FormState>(initialState);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setState(initialState);
    startTransition(async () => {
      const result = await submitFmsApplicationLeadAction(formData);

      if (!result.ok) {
        setState({ error: result.message, leadCode: "", message: "" });
        return;
      }

      formRef.current?.reset();
      setState({
        error: "",
        leadCode: result.leadCode,
        message: result.message,
      });
    });
  }

  return (
    <form
      className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      onSubmit={handleSubmit}
      ref={formRef}
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-emerald">
          FMS application
        </p>
        <h2 className="mt-2 text-2xl font-bold text-brand-navy" lang="zh-CN">
          提交工厂对接专员申请
        </h2>
        <p className="mt-2 text-sm leading-7 text-brand-muted" lang="zh-CN">
          此表格只用于管理员人工审核，不会创建 FMS 账号，也不会自动批准任何角色。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-semibold text-brand-navy">
          Full name / 姓名 *
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-3 font-normal text-brand-text focus:border-brand-emerald focus:outline-none"
            maxLength={120}
            name="full_name"
            required
          />
        </label>
        <label className="space-y-2 text-sm font-semibold text-brand-navy">
          Province / 省份 *
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-3 font-normal text-brand-text focus:border-brand-emerald focus:outline-none"
            maxLength={80}
            name="province"
            required
          />
        </label>
        <label className="space-y-2 text-sm font-semibold text-brand-navy">
          City / 城市 *
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-3 font-normal text-brand-text focus:border-brand-emerald focus:outline-none"
            maxLength={80}
            name="city"
            required
          />
        </label>
        <label className="space-y-2 text-sm font-semibold text-brand-navy">
          WeChat ID / 微信号
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-3 font-normal text-brand-text focus:border-brand-emerald focus:outline-none"
            maxLength={120}
            name="wechat_id"
          />
        </label>
        <label className="space-y-2 text-sm font-semibold text-brand-navy">
          Email / 邮箱
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-3 font-normal text-brand-text focus:border-brand-emerald focus:outline-none"
            maxLength={160}
            name="email"
            type="email"
          />
        </label>
        <label className="space-y-2 text-sm font-semibold text-brand-navy">
          Phone / 电话
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-3 font-normal text-brand-text focus:border-brand-emerald focus:outline-none"
            maxLength={80}
            name="phone"
          />
        </label>
      </div>

      <label className="block space-y-2 text-sm font-semibold text-brand-navy">
        Languages / 语言能力 *
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-3 font-normal text-brand-text focus:border-brand-emerald focus:outline-none"
          maxLength={240}
          name="languages"
          placeholder="Chinese, English, Urdu support, etc."
          required
        />
      </label>

      <label className="block space-y-2 text-sm font-semibold text-brand-navy">
        Product categories / 熟悉产品类别 *
        <textarea
          className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal text-brand-text focus:border-brand-emerald focus:outline-none"
          maxLength={500}
          name="product_categories"
          placeholder="Electronics, textiles, packaging, machinery..."
          required
        />
      </label>

      <label className="block space-y-2 text-sm font-semibold text-brand-navy">
        Factory regions / 可覆盖工厂区域
        <textarea
          className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal text-brand-text focus:border-brand-emerald focus:outline-none"
          maxLength={500}
          name="factory_regions"
          placeholder="Guangzhou, Shenzhen, Yiwu, Foshan..."
        />
      </label>

      <label className="block space-y-2 text-sm font-semibold text-brand-navy">
        Sourcing / factory / 1688 / Alibaba experience *
        <textarea
          className="min-h-32 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal text-brand-text focus:border-brand-emerald focus:outline-none"
          maxLength={900}
          name="sourcing_experience"
          required
        />
      </label>

      <div className="grid gap-3 rounded-lg border border-slate-200 bg-brand-background p-4 text-sm leading-7 text-brand-navy md:grid-cols-2">
        <label className="flex gap-3">
          <input className="mt-1 h-4 w-4" name="can_collect_evidence" type="checkbox" />
          <span>Can collect photos, videos, supplier data, and quotations.</span>
        </label>
        <label className="flex gap-3">
          <input className="mt-1 h-4 w-4" name="can_visit_factories" type="checkbox" />
          <span>Can visit factories when an admin-approved project needs it.</span>
        </label>
      </div>

      <label className="block space-y-2 text-sm font-semibold text-brand-navy">
        Short introduction / 简短介绍
        <textarea
          className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-3 font-normal text-brand-text focus:border-brand-emerald focus:outline-none"
          maxLength={900}
          name="short_introduction"
          placeholder="Tell us why you are a good fit for FMS work."
        />
      </label>

      <label className="flex gap-3 rounded-lg border border-brand-gold bg-amber-50 p-4 text-sm leading-7 text-brand-navy">
        <input className="mt-1 h-4 w-4" name="consent" required type="checkbox" />
        <span>
          I understand this is an application for admin review only. It does not
          create an FMS account, approve work, or allow direct importer contact.
        </span>
      </label>

      <ActionFeedback error={state.error} message={state.message} />

      {state.leadCode ? (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-brand-emerald">
          Application reference: <span translate="no">{state.leadCode}</span>
        </p>
      ) : null}

      <Button disabled={isPending} type="submit" variant="secondary">
        {isPending ? "Submitting..." : "Apply as FMS"}
      </Button>
    </form>
  );
}
