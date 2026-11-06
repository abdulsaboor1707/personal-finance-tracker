
BEGIN;

-- =========================================
-- 1. USERS
-- =========================================

CREATE TABLE public.users (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(100) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    password_hash text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);


-- =========================================
-- 2. DEFAULT CATEGORIES
-- =========================================

CREATE TABLE public.default_categories (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(100) NOT NULL,
    type varchar(10) NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT unique_default_category
        UNIQUE (name, type),

    CONSTRAINT default_categories_type_check
        CHECK (type IN ('income', 'expense'))
);


-- =========================================
-- 3. CATEGORIES
-- =========================================

CREATE TABLE public.categories (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id bigint NOT NULL,
    name varchar(100) NOT NULL,
    type varchar(10) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT unique_category_owner_type
        UNIQUE (id, user_id, type),

    CONSTRAINT unique_category_per_user
        UNIQUE (user_id, name, type),

    CONSTRAINT categories_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users (id)
        ON DELETE CASCADE,

    CONSTRAINT categories_type_check
        CHECK (type IN ('income', 'expense'))
);


-- =========================================
-- 4. BUDGETS
-- =========================================

CREATE TABLE public.budgets (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id bigint NOT NULL,
    amount numeric(15, 2) NOT NULL,
    month date NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT unique_user_monthly_budget
        UNIQUE (user_id, month),

    CONSTRAINT budgets_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users (id)
        ON DELETE CASCADE,

    CONSTRAINT budgets_amount_check
        CHECK (amount > 0),

    CONSTRAINT budgets_month_check
        CHECK (EXTRACT(DAY FROM month) = 1)
);


-- =========================================
-- 5. TRANSACTIONS
-- =========================================

CREATE TABLE public.transactions (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id bigint NOT NULL,
    category_id bigint NOT NULL,
    type varchar(10) NOT NULL,
    amount numeric(15, 2) NOT NULL,
    description text,
    transaction_date date NOT NULL DEFAULT CURRENT_DATE,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT fk_transaction_category
        FOREIGN KEY (category_id, user_id, type)
        REFERENCES public.categories (id, user_id, type)
        ON DELETE RESTRICT,

    CONSTRAINT transactions_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users (id)
        ON DELETE CASCADE,

    CONSTRAINT transactions_amount_check
        CHECK (amount > 0),

    CONSTRAINT transactions_type_check
        CHECK (type IN ('income', 'expense'))
);


-- =========================================
-- 6. DEFAULT CATEGORY SEED DATA
-- =========================================

INSERT INTO public.default_categories (name, type, is_active)
VALUES
    ('Salary', 'income', true),
    ('Business', 'income', true),
    ('Freelancing', 'income', true),
    ('Investment', 'income', true),
    ('Other Income', 'income', true),
    ('Food', 'expense', true),
    ('Groceries', 'expense', true),
    ('Transport', 'expense', true),
    ('Electricity', 'expense', true),
    ('Gas', 'expense', true),
    ('Water', 'expense', true),
    ('Internet', 'expense', true),
    ('Rent', 'expense', true),
    ('Medical', 'expense', true),
    ('Education', 'expense', true),
    ('Shopping', 'expense', true),
    ('Entertainment', 'expense', true),
    ('Other Expenses', 'expense', true)
ON CONFLICT (name, type) DO NOTHING;

COMMIT;
