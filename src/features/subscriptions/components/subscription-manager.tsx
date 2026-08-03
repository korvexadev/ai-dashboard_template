"use client";

import { FormEvent, useEffect, useState } from "react";

import { Icon } from "@/components/icons/icon";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { StatusBadge } from "@/components/ui/status-badge";
import { FreeAccessPolicy } from "@/features/subscriptions/components/free-access-policy";
import {
  createSubscriptionPlan,
  listSubscriptionPlans,
  updateSubscriptionPlan,
} from "@/features/subscriptions/api/subscriptions";
import type { SubscriptionPlan } from "@/lib/api/contracts";

interface PlanForm {
  code: string;
  name: string;
  description: string;
  billingPeriod: "monthly" | "yearly";
  price: string;
  currency: string;
  dailyArticleLimit: string;
  unlimited: boolean;
  status: "active" | "inactive";
}

const emptyForm: PlanForm = {
  code: "",
  name: "",
  description: "",
  billingPeriod: "monthly",
  price: "",
  currency: "MWK",
  dailyArticleLimit: "10",
  unlimited: false,
  status: "active",
};

export function SubscriptionManager({ canManage }: { canManage: boolean }) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>();
  const [selected, setSelected] = useState<SubscriptionPlan>();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<PlanForm>(emptyForm);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    void listSubscriptionPlans()
      .then((items) => {
        if (!active) return;
        setPlans(items);
        const first = items[0];
        if (first) {
          setSelected(first);
          setForm(toForm(first));
        }
        setError(undefined);
      })
      .catch((caught: unknown) => {
        if (active) setError(message(caught));
      });
    return () => {
      active = false;
    };
  }, [retry]);

  function select(plan: SubscriptionPlan) {
    setSelected(plan);
    setCreating(false);
    setForm(toForm(plan));
    setError(undefined);
    setNotice(undefined);
  }

  function beginCreate() {
    setSelected(undefined);
    setCreating(true);
    setForm(emptyForm);
    setError(undefined);
    setNotice(undefined);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage) return;
    setSaving(true);
    setError(undefined);
    setNotice(undefined);
    try {
      let saved: SubscriptionPlan;
      if (creating) {
        saved = await createSubscriptionPlan({
          code: form.code,
          name: form.name,
          ...(form.description.trim()
            ? { description: form.description.trim() }
            : {}),
          billingPeriod: form.billingPeriod,
          priceMinor: toMinorUnits(form.price),
          currency: form.currency,
          dailyArticleLimit: form.unlimited
            ? null
            : Number(form.dailyArticleLimit),
        });
        setPlans((current) => [...(current ?? []), saved]);
        setCreating(false);
      } else if (selected) {
        saved = await updateSubscriptionPlan(
          selected.id,
          selected.planType === "free"
            ? {
                name: form.name,
                description: form.description.trim() || null,
                dailyArticleLimit: Number(form.dailyArticleLimit),
              }
            : {
                name: form.name,
                description: form.description.trim() || null,
                billingPeriod: form.billingPeriod,
                priceMinor: toMinorUnits(form.price),
                currency: form.currency,
                dailyArticleLimit: form.unlimited
                  ? null
                  : Number(form.dailyArticleLimit),
                status: form.status,
              },
        );
        setPlans((current) =>
          current?.map((plan) => (plan.id === saved.id ? saved : plan)),
        );
      } else {
        return;
      }
      setSelected(saved);
      setForm(toForm(saved));
      setNotice(`${saved.name} was saved.`);
    } catch (caught: unknown) {
      setError(message(caught));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="article-workspace subscriptions-page">
      <div className="page-title-row">
        <div>
          <h2>Subscriptions</h2>
          <p>Plans, pricing and daily access.</p>
        </div>
        <div className="subscription-page-actions">
          {canManage ? (
            <button
              className="solid-button"
              type="button"
              onClick={beginCreate}
            >
              <Icon name="plus" /> New plan
            </button>
          ) : null}
        </div>
      </div>

      <FreeAccessPolicy canManage={canManage} />

      {error && !plans ? (
        <div className="list-state" role="alert">
          <Icon name="bell" />
          <h3>Subscriptions are unavailable.</h3>
          <p>{error}</p>
          <button type="button" onClick={() => setRetry((value) => value + 1)}>
            Try again
          </button>
        </div>
      ) : null}

      {!plans && !error ? (
        <div className="article-skeletons" aria-label="Loading subscriptions">
          <span />
          <span />
          <span />
        </div>
      ) : null}

      {plans ? (
        <section className="subscriptions-layout">
          <div className="plan-inventory">
            <header>
              <div>
                <h3>Plans</h3>
                <p>{plans.length} configured</p>
              </div>
            </header>
            <div className="plan-list">
              {plans.map((plan) => (
                <button
                  className={selected?.id === plan.id ? "selected" : undefined}
                  type="button"
                  key={plan.id}
                  onClick={() => select(plan)}
                >
                  <span className="plan-list-icon">
                    <Icon
                      name={plan.planType === "free" ? "users" : "articles"}
                    />
                  </span>
                  <span>
                    <strong>{plan.name}</strong>
                    <small>{formatPrice(plan)}</small>
                  </span>
                  <span>
                    <strong>{plan.subscriberCount}</strong>
                    <small>
                      {plan.subscriberCount === 1 ? "reader" : "readers"}
                    </small>
                  </span>
                  <Icon name="chevron" />
                </button>
              ))}
            </div>
          </div>

          <form className="plan-editor" onSubmit={submit}>
            <header>
              <div>
                <p className="eyebrow">
                  {creating
                    ? "New paid plan"
                    : selected?.planType === "free"
                      ? "Default plan"
                      : "Plan settings"}
                </p>
                <h3>
                  {creating
                    ? "Create subscription"
                    : (selected?.name ?? "Select a plan")}
                </h3>
              </div>
              {selected ? <StatusBadge status={selected.status} /> : null}
            </header>

            {error ? (
              <div className="dashboard-users-error" role="alert">
                <strong>The plan could not be saved.</strong>
                <p>{error}</p>
              </div>
            ) : null}
            {notice ? (
              <div className="plan-notice" role="status">
                <Icon name="checkCircle" />
                {notice}
              </div>
            ) : null}

            {creating || selected ? (
              <div className="plan-fields">
                {creating ? (
                  <label>
                    Plan code
                    <input
                      value={form.code}
                      onChange={(event) =>
                        setForm({ ...form, code: event.target.value })
                      }
                      placeholder="mikozi-plus"
                      maxLength={60}
                      required
                    />
                  </label>
                ) : null}

                <label>
                  Plan name
                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    maxLength={80}
                    required
                    disabled={!canManage}
                  />
                </label>

                <label className="full-field">
                  Description
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                    maxLength={240}
                    rows={3}
                    disabled={!canManage}
                    placeholder="Describe who this plan is for."
                  />
                </label>

                {selected?.planType !== "free" ? (
                  <>
                    <label>
                      Billing period
                      <SearchableSelect
                        ariaLabel="Billing period"
                        value={form.billingPeriod}
                        options={[
                          { value: "monthly", label: "Monthly" },
                          { value: "yearly", label: "Yearly" },
                        ]}
                        onChange={(value) =>
                          setForm({
                            ...form,
                            billingPeriod: value as "monthly" | "yearly",
                          })
                        }
                        disabled={!canManage}
                        searchPlaceholder="Search billing periods"
                      />
                    </label>
                    <label>
                      Price
                      <span className="price-input">
                        <input
                          type="number"
                          value={form.price}
                          onChange={(event) =>
                            setForm({ ...form, price: event.target.value })
                          }
                          min="0.01"
                          step="0.01"
                          required
                          disabled={!canManage}
                        />
                        <SearchableSelect
                          ariaLabel="Currency"
                          className="currency-select"
                          value={form.currency}
                          options={[
                            { value: "MWK", label: "MWK" },
                            { value: "USD", label: "USD" },
                          ]}
                          onChange={(value) =>
                            setForm({
                              ...form,
                              currency: value,
                            })
                          }
                          disabled={!canManage}
                          searchPlaceholder="Search currencies"
                        />
                      </span>
                    </label>
                  </>
                ) : null}

                <label>
                  Daily article limit
                  <input
                    type="number"
                    value={form.dailyArticleLimit}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        dailyArticleLimit: event.target.value,
                      })
                    }
                    min="1"
                    max="10000"
                    required={!form.unlimited}
                    disabled={
                      !canManage ||
                      (selected?.planType !== "free" && form.unlimited)
                    }
                  />
                </label>

                {selected?.planType !== "free" ? (
                  <>
                    <label className="check-field">
                      <input
                        type="checkbox"
                        checked={form.unlimited}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            unlimited: event.target.checked,
                          })
                        }
                        disabled={!canManage}
                      />
                      Unlimited daily articles
                    </label>
                    {!creating ? (
                      <label>
                        Status
                        <SearchableSelect
                          ariaLabel="Plan status"
                          value={form.status}
                          options={[
                            {
                              value: "active",
                              label: "Active",
                              status: "active",
                            },
                            {
                              value: "inactive",
                              label: "Inactive",
                              status: "inactive",
                            },
                          ]}
                          onChange={(value) =>
                            setForm({
                              ...form,
                              status: value as "active" | "inactive",
                            })
                          }
                          disabled={!canManage}
                          searchPlaceholder="Search statuses"
                        />
                      </label>
                    ) : null}
                  </>
                ) : (
                  <div className="free-plan-lock full-field">
                    <Icon name="checkCircle" />
                    <span>
                      <strong>Free plan stays active</strong>
                    </span>
                  </div>
                )}
              </div>
            ) : null}

            {canManage && (creating || selected) ? (
              <footer>
                {creating ? (
                  <button
                    className="outline-button"
                    type="button"
                    onClick={() => {
                      const first = plans[0];
                      setCreating(false);
                      if (first) select(first);
                    }}
                  >
                    Cancel
                  </button>
                ) : null}
                <button
                  className="solid-button"
                  type="submit"
                  disabled={saving}
                >
                  <Icon name="checkCircle" />
                  {saving
                    ? "Saving..."
                    : creating
                      ? "Create plan"
                      : "Save changes"}
                </button>
              </footer>
            ) : (
              <p className="assignment-readonly">
                Only a super administrator can change subscription plans.
              </p>
            )}
          </form>
        </section>
      ) : null}
    </main>
  );
}

function toForm(plan: SubscriptionPlan): PlanForm {
  return {
    code: plan.code,
    name: plan.name,
    description: plan.description ?? "",
    billingPeriod: plan.billingPeriod === "yearly" ? "yearly" : "monthly",
    price: (plan.priceMinor / 100).toFixed(2),
    currency: plan.currency,
    dailyArticleLimit: String(plan.dailyArticleLimit ?? 10),
    unlimited: plan.dailyArticleLimit === null,
    status: plan.status,
  };
}

function toMinorUnits(value: string): number {
  return Math.round(Number(value) * 100);
}

function formatPrice(plan: SubscriptionPlan): string {
  if (plan.planType === "free") {
    return `${plan.dailyArticleLimit} articles daily`;
  }
  const price = new Intl.NumberFormat("en-MW", {
    style: "currency",
    currency: plan.currency,
  }).format(plan.priceMinor / 100);
  return `${price} ${plan.billingPeriod}`;
}

function message(caught: unknown): string {
  return caught instanceof Error
    ? caught.message
    : "The request could not be completed.";
}
