"""
generate_pdf.py
Apple Retail Sales Analysis - project explainer PDF.
Output: ../06_outputs/apple_retail_report.pdf
"""

import os
import warnings
warnings.filterwarnings("ignore")

from fpdf import FPDF
from PIL import Image as PILImage

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR    = os.path.join(SCRIPT_DIR, '..', '06_outputs')
OUT_PDF    = os.path.join(IMG_DIR, 'apple_retail_report.pdf')

# ── Palette (all Latin-1 safe) ────────────────────────────────────────────────
DARK    = (15,  23,  42)
WHITE   = (255, 255, 255)
GRAY    = (100, 116, 139)
LGRAY   = (226, 232, 240)
MGRAY   = (241, 245, 249)
CYAN    = (6,   182, 212)
INDIGO  = (99,  102, 241)
PURPLE  = (168,  85, 247)
AMBER   = (245, 158,  11)
GREEN   = (34,  197,  94)
RED     = (239,  68,  68)
ORANGE  = (249, 115,  22)
TEAL    = (20,  184, 166)

W, H   = 210, 297    # A4
ML, MR = 18, 18
MT     = 26          # top margin (room for header)
MB     = 20          # bottom margin (room for footer)
CW     = W - ML - MR


def aspect_h(fname, draw_w):
    img = PILImage.open(os.path.join(IMG_DIR, fname))
    iw, ih = img.size
    return draw_w * ih / iw


# ── PDF class with auto header / footer ───────────────────────────────────────

class PDF(FPDF):

    def header(self):
        if self.page_no() == 1:
            return
        self.set_y(8)
        self.set_font('Helvetica', '', 7)
        self.set_text_color(*GRAY)
        self.cell(CW // 2, 5, 'Apple Retail Sales Analysis', align='L')
        self.cell(CW // 2, 5, 'Rodney Seth Nyagonchonga  |  Portfolio Project', align='R')
        self.set_draw_color(*LGRAY)
        self.set_line_width(0.25)
        self.line(ML, 15, W - MR, 15)
        self.set_y(MT)

    def footer(self):
        if self.page_no() == 1:
            return
        self.set_y(-(MB - 4))
        self.set_draw_color(*LGRAY)
        self.set_line_width(0.25)
        self.line(ML, self.get_y(), W - MR, self.get_y())
        self.ln(1)
        self.set_font('Helvetica', '', 7)
        self.set_text_color(*GRAY)
        self.cell(CW // 2, 5, 'Python | PostgreSQL | Prophet | seaborn | Supabase', align='L')
        self.cell(CW // 2, 5, f'Page {self.page_no()}', align='R')

    # ── Helpers ───────────────────────────────────────────────────────────────

    def section_title(self, text, color=CYAN):
        """Coloured left-pip section heading."""
        self.ln(4)
        y = self.get_y() + 1.5
        self.set_fill_color(*color)
        self.rect(ML, y, 3, 7, 'F')
        self.set_xy(ML + 6, self.get_y())
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(*DARK)
        self.cell(0, 10, text.upper(), ln=True)
        self.set_draw_color(*color)
        self.set_line_width(0.25)
        self.line(ML, self.get_y(), W - MR, self.get_y())
        self.ln(4)

    def h3(self, text, color=DARK):
        self.set_font('Helvetica', 'B', 9)
        self.set_text_color(*color)
        self.cell(0, 6, text, ln=True)
        self.ln(1)

    def para(self, text, color=DARK, size=9.5):
        self.set_font('Helvetica', '', size)
        self.set_text_color(*color)
        self.multi_cell(CW, 5.2, text)
        self.ln(3)

    def bullet(self, text, color=CYAN):
        y0 = self.get_y()
        self.set_fill_color(*color)
        self.rect(ML, y0 + 2.2, 2.2, 2.2, 'F')
        self.set_xy(ML + 6, y0)
        self.set_font('Helvetica', '', 9)
        self.set_text_color(*DARK)
        self.multi_cell(CW - 6, 5, text)
        self.ln(0.5)

    def tag_row(self, items, y):
        """Draw a row of coloured tag pills at absolute y, return final x."""
        x = ML
        self.set_font('Helvetica', 'B', 7.5)
        for txt, col in items:
            tw = self.get_string_width(txt) + 6
            if x + tw > W - MR:
                break
            r, g, b = col
            self.set_fill_color(r, g, b)
            self.set_draw_color(max(0,r-30), max(0,g-30), max(0,b-30))
            self.set_line_width(0.2)
            self.rect(x, y + 0.5, tw, 5.5, 'FD')
            self.set_text_color(*WHITE)
            self.set_xy(x, y)
            self.cell(tw, 6.5, txt, ln=False)
            x += tw + 3

    def embed(self, fname, caption, w=None, center=True):
        """Embed chart; auto page-break if needed."""
        path = os.path.join(IMG_DIR, fname)
        if not os.path.exists(path):
            self.para(f'[missing: {fname}]', color=RED)
            return
        draw_w = w or CW
        draw_h = aspect_h(fname, draw_w)
        # clamp to available height minus caption
        avail = H - MB - MT - 10
        if draw_h > avail:
            draw_h = avail
            draw_w = draw_h * (PILImage.open(path).size[0] / PILImage.open(path).size[1])
            draw_w = min(draw_w, CW)
            draw_h = aspect_h(fname, draw_w)
        if self.get_y() + draw_h + 10 > H - MB:
            self.add_page()
        x = (W - draw_w) / 2 if center else ML
        self.image(path, x=x, y=self.get_y(), w=draw_w, h=draw_h)
        self.set_y(self.get_y() + draw_h + 2)
        self.set_font('Helvetica', 'I', 7.5)
        self.set_text_color(*GRAY)
        self.cell(CW, 4, caption, align='C', ln=True)
        self.ln(4)

    def two_charts(self, f1, f2, cap):
        """Place two landscape charts side by side."""
        tw = (CW - 4) / 2
        h1 = aspect_h(f1, tw)
        h2 = aspect_h(f2, tw)
        row_h = max(h1, h2)
        if self.get_y() + row_h + 10 > H - MB:
            self.add_page()
        y0 = self.get_y()
        self.image(os.path.join(IMG_DIR, f1), x=ML,        y=y0, w=tw, h=h1)
        self.image(os.path.join(IMG_DIR, f2), x=ML+tw+4,   y=y0, w=tw, h=h2)
        self.set_y(y0 + row_h + 2)
        self.set_font('Helvetica', 'I', 7.5)
        self.set_text_color(*GRAY)
        self.cell(CW, 4, cap, align='C', ln=True)
        self.ln(4)

    def kv(self, key, val, kw=56):
        self.set_font('Helvetica', 'B', 8.5)
        self.set_text_color(*GRAY)
        self.cell(kw, 5.5, key, ln=False)
        self.set_font('Helvetica', '', 8.5)
        self.set_text_color(*DARK)
        self.cell(0, 5.5, val, ln=True)

    def table_row(self, cols, widths, i, bold_first=True):
        bg = MGRAY if i % 2 == 0 else WHITE
        self.set_fill_color(*bg)
        self.rect(ML, self.get_y(), CW, 6, 'F')
        x0 = ML
        for j, (col, w) in enumerate(zip(cols, widths)):
            self.set_xy(x0, self.get_y())
            if j == 0 and bold_first:
                self.set_font('Helvetica', 'B', 8)
                self.set_text_color(*DARK)
            elif j == 1:
                self.set_font('Courier', '', 7.5)
                self.set_text_color(*INDIGO)
            else:
                self.set_font('Helvetica', '', 8)
                self.set_text_color(*CYAN)
            # last column: don't ln, advance x manually
            self.cell(w, 6, col, ln=False)
            x0 += w
        self.ln(6)


# =============================================================================
# BUILD
# =============================================================================

def build():
    pdf = PDF()
    pdf.set_auto_page_break(auto=True, margin=MB)

    # =========================================================================
    # PAGE 1 -- COVER (no header/footer)
    # =========================================================================
    pdf.add_page()

    # Dark hero band
    pdf.set_fill_color(*DARK)
    pdf.rect(0, 0, W, 115, 'F')
    pdf.set_fill_color(*CYAN)
    pdf.rect(0, 113, W, 2.5, 'F')

    # Title
    pdf.set_xy(ML, 25)
    pdf.set_font('Helvetica', 'B', 30)
    pdf.set_text_color(*WHITE)
    pdf.multi_cell(CW, 13, 'Apple Retail Sales\nAnalysis')

    pdf.set_xy(ML, 72)
    pdf.set_font('Helvetica', '', 11)
    pdf.set_text_color(*CYAN)
    pdf.cell(CW, 7, 'End-to-end analytics pipeline  |  1,040,200 transactions', ln=True)

    pdf.set_xy(ML, 81)
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(175, 195, 215)
    pdf.cell(CW, 7, 'Jan 2022 - Dec 2023  |  10 product categories  |  75 global stores', ln=True)

    pdf.set_xy(ML, 97)
    pdf.set_font('Helvetica', 'B', 9)
    pdf.set_text_color(*WHITE)
    pdf.cell(CW, 5, "Rodney Seth Nyagonchong'a  |  Senior Data Analyst", ln=True)

    # Tech tags
    pdf.tag_row([
        ('PostgreSQL', INDIGO), ('Python 3.13', CYAN), ('Prophet', PURPLE),
        ('pandas', AMBER), ('seaborn', TEAL), ('SQLAlchemy', GREEN),
        ('Supabase', ORANGE), ('Matplotlib', RED),
    ], y=125)

    # Module boxes
    bw = 38
    gap = (CW - bw * 4) / 3
    box_y = 144
    modules = [
        ('01', 'EDA',          '6 charts | Revenue\n& market share', CYAN),
        ('02', 'Lifecycle',    '3 charts | Launch\nramp analysis',   INDIGO),
        ('03', 'Forecasting',  '11 charts | Prophet\n12-mo forecast', PURPLE),
        ('04', 'Warranty',     '5 charts | Claim\nrate analysis',    AMBER),
    ]
    for i, (num, name, sub, col) in enumerate(modules):
        bx = ML + i * (bw + gap)
        pdf.set_fill_color(*col)
        pdf.set_draw_color(*col)
        pdf.set_line_width(0.4)
        pdf.rect(bx, box_y, bw, 30, 'FD')
        pdf.set_xy(bx + 2, box_y + 2)
        pdf.set_font('Helvetica', 'B', 18)
        pdf.set_text_color(*col)
        pdf.cell(bw - 4, 10, num, ln=False)
        pdf.set_xy(bx + 2, box_y + 12)
        pdf.set_font('Helvetica', 'B', 9)
        pdf.set_text_color(*DARK)
        pdf.cell(bw - 4, 5.5, name, ln=False)
        pdf.set_xy(bx + 2, box_y + 19)
        pdf.set_font('Helvetica', '', 7)
        pdf.set_text_color(*GRAY)
        pdf.multi_cell(bw - 4, 4, sub)

    # Stat tiles
    tile_y = 190
    sw = (CW - 6) / 4
    tiles = [
        ('1,040,200', 'Sales Rows',     'Fact table',         CYAN),
        ('5',         'Linked Tables',  'Normalised schema',  INDIGO),
        ('10',        'Categories',     'HW + services',      PURPLE),
        ('75',        'Global Stores',  'Americas | EU | APAC', AMBER),
    ]
    for i, (val, lbl, sub, col) in enumerate(tiles):
        tx = ML + i * (sw + 2)
        pdf.set_fill_color(*LGRAY)
        pdf.set_draw_color(*col)
        pdf.set_line_width(0.4)
        pdf.rect(tx, tile_y, sw, 24, 'FD')
        pdf.set_xy(tx + 2, tile_y + 2)
        pdf.set_font('Helvetica', 'B', 13)
        pdf.set_text_color(*col)
        pdf.cell(sw - 4, 8, val, ln=False)
        pdf.set_xy(tx + 2, tile_y + 11)
        pdf.set_font('Helvetica', 'B', 7.5)
        pdf.set_text_color(*DARK)
        pdf.cell(sw - 4, 5, lbl, ln=False)
        pdf.set_xy(tx + 2, tile_y + 17)
        pdf.set_font('Helvetica', '', 6.5)
        pdf.set_text_color(*GRAY)
        pdf.cell(sw - 4, 5, sub, ln=False)

    # Cover footer band
    pdf.set_fill_color(*DARK)
    pdf.rect(0, H - 12, W, 12, 'F')
    pdf.set_xy(ML, H - 8)
    pdf.set_font('Helvetica', '', 7.5)
    pdf.set_text_color(*GRAY)
    pdf.cell(CW, 5, "Apple Retail Sales Analysis  |  Rodney Seth Nyagonchong'a  |  Portfolio Project 03",
             align='C', ln=False)

    # =========================================================================
    # PAGE 2 -- PROJECT OVERVIEW & ARCHITECTURE
    # =========================================================================
    pdf.add_page()

    pdf.section_title('Project Overview', CYAN)
    pdf.para(
        'This project builds a complete analytics pipeline on a synthetic Apple retail '
        'dataset of 1,040,200 individual sales transactions across 10 product categories '
        'and 75 global stores (January 2022 - December 2023). Four analytical modules '
        'were built end-to-end: exploratory data analysis (EDA), product lifecycle '
        'profiling, 12-month revenue forecasting with Meta\'s Prophet, and warranty '
        'claim analytics.'
    )
    pdf.para(
        'All data is stored in a PostgreSQL schema on Supabase with 15 purpose-built '
        'analytical views powering four Python chart pipelines. The project simulates '
        'the breadth of analysis a senior data analyst would perform for a consumer '
        'electronics retailer: from raw CSV ingestion through to production-ready charts.'
    )

    pdf.section_title('Database Schema', INDIGO)

    schema = [
        ('category',  'category_id PK',  'VARCHAR(20)',  'category_name'),
        ('products',  'product_id PK',   'VARCHAR(20)',  'category_id FK | product_name | price'),
        ('stores',    'store_id PK',      'VARCHAR(20)',  'store_name | country | region'),
        ('sales',     'sale_id PK',       'VARCHAR(20)',  'store_id FK | product_id FK | sale_date | quantity'),
        ('warranty',  'claim_id PK',      'VARCHAR(20)',  'sale_id FK | claim_date | repair_status'),
    ]
    table_colors = [CYAN, PURPLE, TEAL, INDIGO, AMBER]
    for (tbl, pk, dtype, rest), col in zip(schema, table_colors):
        pdf.set_fill_color(*col)
        pdf.rect(ML, pdf.get_y() + 1, 2.5, 5, 'F')
        pdf.set_xy(ML + 5, pdf.get_y())
        pdf.set_font('Helvetica', 'B', 9)
        pdf.set_text_color(*col)
        pdf.cell(22, 6.5, tbl, ln=False)
        pdf.set_font('Courier', '', 7.5)
        pdf.set_text_color(*INDIGO)
        pdf.cell(28, 6.5, pk, ln=False)
        pdf.set_font('Helvetica', '', 7.5)
        pdf.set_text_color(*GRAY)
        pdf.cell(22, 6.5, dtype, ln=False)
        pdf.set_font('Helvetica', '', 7.5)
        pdf.set_text_color(*DARK)
        pdf.multi_cell(CW - 77, 6.5, rest)

    pdf.ln(2)
    pdf.section_title('Technology Stack', TEAL)

    stack = [
        (CYAN,    'PostgreSQL / Supabase', 'Cloud-hosted DB | 15 analytical views | PgBouncer pooler'),
        (PURPLE,  'Python 3.13',           'pandas | numpy | SQLAlchemy | psycopg2 | python-dotenv'),
        (INDIGO,  'Prophet (Meta)',         '12-month multiplicative seasonality forecast per category'),
        (AMBER,   'seaborn / matplotlib',   'Statistical and time-series chart pipelines (150 dpi PNG)'),
        (GREEN,   'statsmodels',            'STL decomposition for seasonal trend isolation'),
    ]
    for col, name, desc in stack:
        pdf.set_fill_color(*col)
        pdf.rect(ML, pdf.get_y() + 2, 2.5, 4, 'F')
        pdf.set_xy(ML + 5, pdf.get_y())
        pdf.set_font('Helvetica', 'B', 9)
        pdf.set_text_color(*col)
        pdf.cell(38, 6, name, ln=False)
        pdf.set_font('Helvetica', '', 8.5)
        pdf.set_text_color(*GRAY)
        pdf.multi_cell(CW - 43, 6, desc)

    pdf.ln(2)
    pdf.section_title('Analytical Views (PostgreSQL)', INDIGO)

    views = [
        ('v_category_monthly_revenue',       'Monthly revenue per category with YoY growth via LAG window'),
        ('v_annual_category_revenue',        'Annual revenue totals and market share percentages'),
        ('v_top_products_by_category',       'Top products ranked by revenue within each category'),
        ('v_store_performance',              'Store revenue, transaction volume, avg basket size'),
        ('v_top_stores_by_region',           'Top-10 stores ranked by revenue within each world region'),
        ('v_category_sales_by_region',       'Cross-tab: category x region revenue breakdown'),
        ('v_launch_revenue_ramp',            'Week-over-week revenue growth from each product launch date'),
        ('v_avg_launch_ramp_by_category',    'Average ramp curve aggregated to category level'),
        ('v_product_lifecycle_stage',        'Stage classification: launch / growth / mature / decline'),
        ('v_peak_sales_timing',              'Identifies peak revenue week and month per product'),
        ('v_repair_status_distribution',     'Count and share of warranty claims by repair outcome'),
        ('v_warranty_claim_rate_by_category','Annual claim rate (%) per product category'),
        ('v_time_to_claim_analysis',         'Avg / median days from sale date to warranty claim'),
        ('v_store_warranty_hotspots',        'Top stores ranked by warranty claim rate'),
        ('v_warranty_monthly_trend',         'Monthly claim volume broken down by repair status'),
    ]
    for vname, vdesc in views:
        pdf.set_xy(ML, pdf.get_y())
        pdf.set_font('Courier', 'B', 7.5)
        pdf.set_text_color(*TEAL)
        pdf.cell(76, 5.5, vname, ln=False)
        pdf.set_font('Helvetica', '', 8)
        pdf.set_text_color(*DARK)
        pdf.multi_cell(CW - 76, 5.5, vdesc)

    # =========================================================================
    # PAGE 3 -- EDA: REVENUE OVERVIEW
    # =========================================================================
    pdf.add_page()
    pdf.section_title('Module 01  |  EDA - Revenue Overview', CYAN)
    pdf.para(
        'The EDA module examines overall revenue distribution, category market share, '
        'annual performance, and top product rankings. All charts are generated directly '
        'from SQL views joined across the five-table star schema.'
    )

    pdf.embed('01_revenue_overview.png',
              'Fig 1  |  Monthly revenue index by category (Jan 2022 - Dec 2023)', w=CW)
    pdf.embed('02_market_share.png',
              'Fig 2  |  Revenue market share by category (stacked % area chart)', w=CW)

    pdf.h3('Key Findings')
    for f in [
        'Tablet leads 2023 revenue at $195.2M, followed by Accessories ($191.0M) and Smartphone ($176.0M).',
        'Streaming Device posted the highest YoY growth (+3.3%) while Smart Speaker fell the most (-3.4%).',
        'Laptop is the only hardware category in positive YoY territory (+1.1%), driven by MacBook Air M1/M2.',
        'Revenue is unusually flat month-over-month - no extreme Q4 spikes, consistent with a synthetic dataset.',
        'Smart Speaker and Streaming Device together account for under 4% of total portfolio revenue.',
    ]:
        pdf.bullet(f)

    # =========================================================================
    # PAGE 4 -- EDA: ANNUAL SUMMARY & TOP PRODUCTS
    # =========================================================================
    pdf.add_page()
    pdf.section_title('Module 01  |  EDA - Annual Summary & Top Products', CYAN)

    pdf.embed('04_annual_summary.png',
              'Fig 3  |  Annual revenue by category - 2022 vs 2023 comparison', w=CW)
    pdf.embed('05_top_products.png',
              'Fig 4  |  Top-5 products by revenue across all categories', w=CW)

    pdf.h3('Key Findings')
    for f in [
        '8 of 10 categories declined YoY but all within 3.4% - the portfolio is fundamentally stable.',
        'Subscription Service, Streaming Device, and Laptop are the only growth categories.',
        'HomePod dominates Smart Speaker at 82% intra-category share - the highest concentration in the dataset.',
        'Accessories revenue spreads across a long tail (top product at 12%), contrasting Desktop where iMac 27-inch alone holds 23%.',
        'Apple TV HD and Apple TV 4K are perfectly matched at 42% each within Streaming Device - complementary not cannibalising.',
    ]:
        pdf.bullet(f)

    # =========================================================================
    # PAGE 5 -- PRODUCT LIFECYCLE
    # =========================================================================
    pdf.add_page()
    pdf.section_title('Module 02  |  Product Lifecycle Analysis', INDIGO)
    pdf.para(
        'The lifecycle module profiles each product from its first sale date, computing '
        'a week-over-week revenue ramp curve. Products are classified into four lifecycle '
        'stages (Launch, Growth, Mature, Decline) based on recency of first sale and '
        'trailing revenue trend. STL decomposition isolates the trend component from '
        'seasonal noise for each of the 10 product categories.'
    )

    pdf.embed('07_avg_launch_ramp.png',
              'Fig 5  |  Average revenue ramp - weeks 1 to 52 post product launch', w=CW)
    pdf.embed('08_peak_timing.png',
              'Fig 6  |  Peak sales timing heatmap by product and calendar month', w=CW)

    pdf.h3('Key Findings')
    for f in [
        'Accessories products peak fastest - most reach maximum weekly revenue within the first 8 weeks of launch.',
        'Desktop and Laptop ramp slowest, typically peaking at weeks 12-16, consistent with enterprise refresh cycles.',
        'The average ramp (Fig 5) shows a sharp week-2 spike then decay to a stable baseline by week 12.',
        'Peak sales (Fig 6) cluster in Q4 (Oct-Dec) with a secondary cluster in March-April - classic consumer electronics seasonality.',
        "Smart Speaker shows the flattest ramp - HomePod's niche positioning generates less launch-event demand than high-volume categories.",
    ]:
        pdf.bullet(f, color=INDIGO)

    # =========================================================================
    # PAGE 6 -- REVENUE FORECASTING
    # =========================================================================
    pdf.add_page()
    pdf.section_title('Module 03  |  Revenue Forecasting (Prophet, 12 Months)', PURPLE)
    pdf.para(
        'One Prophet model was fitted per category on 24 months of training data '
        '(Jan 2022 - Dec 2023). The model uses multiplicative yearly seasonality plus a '
        "custom 'launch_cycle' component (Fourier order 5) to capture Apple's "
        'Sep-Oct product launch rhythm. Changepoint prior scale of 0.15 allows moderate '
        'trend flexibility. Forecast horizon: 12 months with 90% confidence intervals.'
    )

    pdf.embed('10_forecast_all_categories.png',
              'Fig 7  |  12-month revenue forecast - all 10 categories (dashed = forecast, shaded = 90% CI)',
              w=CW)

    pdf.h3('Sample Per-Category Forecasts')
    pdf.two_charts('09_forecast_tablet.png', '09_forecast_laptop.png',
                   'Fig 8  |  Tablet (left) and Laptop (right) - individual 12-month Prophet forecasts')
    pdf.two_charts('09_forecast_smartphone.png', '09_forecast_streaming_device.png',
                   'Fig 9  |  Smartphone (left) and Streaming Device (right) - 12-month Prophet forecasts')

    pdf.h3('Key Findings')
    for f in [
        'With 24 months of training data Prophet confidence intervals are wide (+/-15-20%) - treat as directional only.',
        'Tablet and Accessories forecasts show stable flat trends consistent with near-zero YoY in the training period.',
        'Streaming Device is the only category where Prophet projects a meaningful upward trend through 2024.',
        'Smart Speaker forecasts continued slow decline, the model extending the -3.4% YoY trend it observed.',
        'All categories show mild Q4 uplift in the forecast, driven by yearly seasonality learned from 2 holiday periods.',
        'Per-category forecast CSVs were exported to 06_outputs/csv/ for downstream BI or modelling use.',
    ]:
        pdf.bullet(f, color=PURPLE)

    # =========================================================================
    # PAGE 7 -- WARRANTY ANALYTICS
    # =========================================================================
    pdf.add_page()
    pdf.section_title('Module 04  |  Warranty Analytics', AMBER)
    pdf.para(
        'Five charts examine warranty claim outcomes, category-level claim rates, '
        'time-from-sale to claim, store hotspots, and monthly claim volume trends. '
        'All queries use pre-aggregated PostgreSQL views to avoid timeout on the raw '
        '1M-row sales join through the Supabase PgBouncer pooler.'
    )

    # Donut + claim rate side by side
    donut_w = 68
    donut_h = aspect_h('12_repair_status_donut.png', donut_w)
    cr_w    = CW - donut_w - 4
    cr_h    = aspect_h('13_claim_rate_by_category.png', cr_w)
    y0      = pdf.get_y()
    pdf.image(os.path.join(IMG_DIR, '12_repair_status_donut.png'),
              x=ML, y=y0, w=donut_w, h=donut_h)
    # vertically centre the shorter claim-rate chart
    cr_offset = (donut_h - cr_h) / 2
    pdf.image(os.path.join(IMG_DIR, '13_claim_rate_by_category.png'),
              x=ML + donut_w + 4, y=y0 + max(0, cr_offset), w=cr_w, h=cr_h)
    pdf.set_y(y0 + max(donut_h, cr_h) + 2)
    pdf.set_font('Helvetica', 'I', 7.5)
    pdf.set_text_color(*GRAY)
    pdf.cell(CW, 4, 'Fig 10  |  Repair status distribution (left) and claim rate by category 2022-2023 (right)',
             align='C', ln=True)
    pdf.ln(4)

    pdf.embed('14_time_to_claim_bars.png',
              'Fig 11  |  Average days from sale to warranty claim, by category and repair status', w=CW)
    pdf.embed('15_store_hotspots.png',
              'Fig 12  |  Top 20 stores by warranty claim rate and claim count by status (heatmap)', w=CW)
    pdf.embed('16_monthly_warranty_trend.png',
              'Fig 13  |  Monthly warranty claim volume by repair status (Jan 2022 - Dec 2023)', w=CW)

    pdf.h3('Key Findings')
    for f in [
        'Smart Speaker has the highest claim rate (3.14%) despite being the smallest revenue category.',
        'Laptop (3.08%) and Audio (3.05%) are also elevated; Wearable (2.67%) and Streaming Device (2.64%) are lowest.',
        '"Rejected" claims arrive later than Completed or In Progress, consistent with out-of-warranty submission attempts.',
        'Store hotspot analysis reveals geographic clustering - flagging specific locations for targeted quality intervention.',
        'Monthly claim volume is stable with no spikes, suggesting no systemic defect events in the 2022-2023 window.',
        'All category claim rates fall within 2.6-3.1% - the narrow spread likely reflects the synthetic data distribution.',
    ]:
        pdf.bullet(f, color=AMBER)

    # =========================================================================
    # PAGE 8 -- METHODOLOGY
    # =========================================================================
    pdf.add_page()
    pdf.section_title('Methodology & Data Pipeline', TEAL)
    pdf.para(
        'The pipeline follows an analytics engineering pattern: raw CSVs -> normalised '
        'PostgreSQL schema -> SQL analytical views -> Python chart pipelines. '
        'Transformation logic lives in SQL (testable, reusable); presentation logic in '
        'Python (full chart control with matplotlib/seaborn).'
    )

    steps = [
        ('Step 1  |  Data Ingestion',     'load_to_supabase.py',
         '5 CSV files loaded into apple_retail schema via SQLAlchemy + psycopg2. '
         'Sales inserted in 5,000-row chunks. Explicit SET search_path TO apple_retail '
         'required on every connection to work around PgBouncer resetting connection settings.'),
        ('Step 2  |  Schema Creation',    '01_create_schema.sql',
         '5 tables with VARCHAR(20) PKs matching alphanumeric CSV IDs (CAT-1, ST-1, P-1). '
         'Date columns use DATE type; pandas dayfirst=True handles the DD-MM-YYYY format in the raw sales CSV.'),
        ('Step 3  |  Analytical Views',   '03-05_*_views.sql',
         '15 fully-qualified views (apple_retail.view_name) created with explicit '
         'apple_retail.table_name references throughout. Avoids schema-placement ambiguity '
         'via PgBouncer. Uses LAG, RANK, ROW_NUMBER window functions and CTEs.'),
        ('Step 4  |  EDA',                'apple_eda.py',
         '6 charts: revenue overview, market share, STL decomposition (per category), '
         'annual summary, and top products. seaborn darkgrid theme with consistent palette.'),
        ('Step 5  |  Lifecycle',          'product_lifecycle.py',
         'Week-over-week ramp curves from v_launch_revenue_ramp. STL decomposition '
         '(statsmodels) isolates trend from seasonal noise per category.'),
        ('Step 6  |  Forecasting',        'revenue_forecast.py',
         'Prophet model per category on v_category_monthly_revenue. '
         'Fix: pd.to_datetime().dt.tz_localize(None) strips timezone added by Supabase. '
         'Per-category PNG + combined overlay + CSV exports.'),
        ('Step 7  |  Warranty',           'warranty_analysis.py',
         '5 warranty charts via pre-aggregated views. v_time_to_claim_analysis '
         'pre-computes avg/median in SQL to avoid raw 1M-row join timeout on the pooler.'),
    ]
    for title, script, desc in steps:
        pdf.set_font('Helvetica', 'B', 9)
        pdf.set_text_color(*TEAL)
        pdf.cell(0, 6, title, ln=True)
        pdf.set_font('Courier', '', 8)
        pdf.set_text_color(*INDIGO)
        pdf.cell(0, 5.5, script, ln=True)
        pdf.set_font('Helvetica', '', 8.5)
        pdf.set_text_color(*GRAY)
        pdf.multi_cell(CW, 5, desc)
        pdf.ln(3)

    # =========================================================================
    # PAGE 9 -- LIMITATIONS, NEXT STEPS & OUTPUT SUMMARY
    # =========================================================================
    pdf.add_page()
    pdf.section_title('Limitations', RED)
    for f in [
        'Synthetic dataset: artificially flat revenue - no real launch spikes, holiday surges, or supply shocks.',
        'Short forecast window: 24 months is minimum viable for Prophet; CIs are wide (+/-15-20%) and directional only.',
        'PgBouncer: Supabase pooler strips connection-level search_path, requiring explicit SET on every query.',
        'No customer data: no customer ID, loyalty, or demographics - cohort or CLV analysis not possible.',
        'Warranty rates are uniformly distributed (2.6-3.1%) - atypical for real hardware where complexity drives claims.',
    ]:
        pdf.bullet(f, color=RED)

    pdf.ln(2)
    pdf.section_title('Potential Next Steps', GREEN)
    for f in [
        'Customer segmentation: add a customer table to enable CLV analysis and churn modelling.',
        'Live dashboard: connect Supabase views to Power BI or Streamlit - the views are structured for this.',
        'Longer horizon: 36+ months of data would narrow Prophet CIs to +/-5-8%, operationally useful.',
        'Store ML model: regression on store features (region, size, mix) to predict warranty claim rates.',
        'Anomaly detection: isolation forest on monthly sales to flag unusual revenue events automatically.',
    ]:
        pdf.bullet(f, color=GREEN)

    pdf.ln(3)
    pdf.section_title('Output Summary', CYAN)

    # Table header
    pdf.set_font('Helvetica', 'B', 8.5)
    pdf.set_text_color(*GRAY)
    pdf.set_draw_color(*LGRAY)
    pdf.set_line_width(0.2)
    col_w = [50, 90, 34]
    pdf.cell(col_w[0], 6, 'Output Type',  ln=False)
    pdf.cell(col_w[1], 6, 'Location',     ln=False)
    pdf.cell(col_w[2], 6, 'Count',        ln=True)
    pdf.line(ML, pdf.get_y(), W - MR, pdf.get_y())
    pdf.ln(1)

    rows = [
        ('EDA charts',         '06_outputs/01-05_*.png',                  '6 PNGs'),
        ('STL decomposition',  '06_outputs/03_decomp_*.png',              '10 PNGs'),
        ('Lifecycle charts',   '06_outputs/06-08_*.png',                  '3 PNGs'),
        ('Forecast charts',    '06_outputs/09-10_forecast*.png',          '11 PNGs'),
        ('Forecast CSVs',      '06_outputs/csv/forecast_*.csv',           '10 CSVs'),
        ('Warranty charts',    '06_outputs/12-16_*.png',                  '5 PNGs'),
        ('SQL views',          '02_sql/03-05_*_views.sql',                '15 views'),
        ('Python scripts',     '03_python/ | 04_forecasting/ | 05_warranty/', '4 scripts'),
        ('This report',        '07_report/apple_retail_report.pdf',       '1 PDF'),
    ]
    for i, row in enumerate(rows):
        pdf.table_row(row, col_w, i)

    pdf.output(OUT_PDF)
    print(f'Saved -> {OUT_PDF}')


if __name__ == '__main__':
    build()
