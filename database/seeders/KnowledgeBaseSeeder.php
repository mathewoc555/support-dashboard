<?php

namespace Database\Seeders;

use App\Models\KnowledgeBase;
use App\Models\KnowledgeBaseCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class KnowledgeBaseSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->content() as $categoryName => $data) {
            $category = KnowledgeBaseCategory::updateOrCreate(
                ['name' => $categoryName],
                ['slug' => Str::slug($categoryName), 'description' => $data['description']],
            );

            foreach ($data['articles'] as $article) {
                KnowledgeBase::updateOrCreate(
                    ['knowledge_base_category_id' => $category->id, 'title' => $article['title']],
                    $article + ['active' => true],
                );
            }
        }
    }

    private function content(): array
    {
        return [
            'Account & Access Management' => [
                'description' => 'Customer identity, order access, account records, and secure verification.',
                'articles' => [
                    [
                        'title' => 'Customer cannot access an account or order history',
                        'problem' => 'The customer cannot sign in, reset a password, or locate an order under the expected email address.',
                        'agent_steps' => "1. Verify the customer using the order email and order number; never request a password.\n2. Confirm whether checkout used a guest account or a different email alias.\n3. Check for spelling differences and payment-provider email addresses.\n4. Send the approved password-reset flow when an account exists.\n5. Escalate only after documenting the identifiers checked and the exact error.",
                        'customer_response' => 'Confirm the order email and order number so we can safely locate the purchase and restore access.',
                        'keywords' => ['login', 'password', 'account', 'order history', 'email', 'access'],
                    ],
                    [
                        'title' => 'Change customer or shipping information safely',
                        'problem' => 'A customer asks to change identity, contact, or shipping information after ordering.',
                        'agent_steps' => "1. Verify the requester against the order record.\n2. Check fulfillment status before promising any change.\n3. If the order has not entered fulfillment, apply the approved correction and document it.\n4. If shipped, do not redirect informally; explain carrier or return options.\n5. Never expose account or order details to an unverified requester.",
                        'customer_response' => 'We will verify the order and fulfillment stage before confirming whether the requested change is still possible.',
                        'keywords' => ['address', 'email change', 'shipping change', 'account details', 'verification'],
                    ],
                ],
            ],
            'Billing' => [
                'description' => 'Payments, invoices, pricing, bulk discounts, taxes, and refunds.',
                'articles' => [
                    [
                        'title' => 'Payment, duplicate charge, or invoice concern',
                        'problem' => 'The customer reports a declined payment, duplicate authorization, incorrect charge, or missing invoice.',
                        'agent_steps' => "1. Collect the order number, charge date, amount, and payment method type; never collect full card data.\n2. Distinguish a pending authorization from a captured charge.\n3. Verify the order and payment state in the commerce system.\n4. Resend the invoice or explain the authorization release window when applicable.\n5. Escalate captured duplicates or mismatched totals to billing with documented evidence.",
                        'customer_response' => 'We will verify the order and payment state and explain whether the amount is an authorization or completed charge.',
                        'keywords' => ['payment', 'charge', 'invoice', 'declined', 'duplicate', 'refund', 'billing'],
                    ],
                    [
                        'title' => 'Bulk pricing and quantity discount request',
                        'problem' => 'An infrastructure buyer needs volume inventory, matching SKUs, or bulk pricing.',
                        'agent_steps' => "1. Record exact manufacturer part numbers, capacity, interface, quantity, and required delivery date.\n2. Confirm whether matching firmware or production lots are required.\n3. Check available quantity without promising unverified stock.\n4. Route qualified volume requests for discount review.\n5. State that published pricing remains valid until a formal bulk offer is confirmed.",
                        'customer_response' => 'Share the exact SKU, quantity, compatibility constraints, and target date so we can verify matching inventory and volume pricing.',
                        'keywords' => ['bulk', 'discount', 'volume', 'quote', 'quantity', 'pricing', 'sku'],
                    ],
                ],
            ],
            'Technical Issues' => [
                'description' => 'Compatibility, hardware health, SMART data, throughput, installation, and diagnostics.',
                'articles' => [
                    [
                        'title' => 'Drive compatibility verification before purchase',
                        'problem' => 'The buyer is unsure whether a drive or component will work with a server, controller, enclosure, or array.',
                        'agent_steps' => "1. Collect the server/enclosure model, controller or HBA model, backplane, interface, form factor, and current drive part number.\n2. Confirm SAS versus SATA/NVMe, sector format, capacity limits, firmware restrictions, and carrier requirements.\n3. Compare the requested inventory SKU against documented platform requirements.\n4. Do not guarantee compatibility from capacity alone.\n5. If documentation is inconclusive, escalate to a hardware specialist before the customer orders.",
                        'customer_response' => 'Please provide the system, controller, backplane, current drive part number, and required interface so we can verify compatibility before purchase.',
                        'keywords' => ['compatible', 'compatibility', 'server', 'controller', 'hba', 'sas', 'sata', 'nvme', 'firmware', 'sector'],
                    ],
                    [
                        'title' => 'SMART, sector, throughput, or drive-health concern',
                        'problem' => 'A customer reports SMART warnings, bad sectors, failed initialization, unexpected health data, or low throughput.',
                        'agent_steps' => "1. Request the order number, drive serial number, full SMART output, diagnostic logs, and test environment.\n2. Confirm cables, bays, controller firmware, and whether the test is direct or behind RAID.\n3. Preserve customer data; never ask the customer to run destructive tests without explicit warning.\n4. Compare evidence with the documented sector scan, SMART evaluation, and throughput testing standards.\n5. If failure criteria are met, begin the documented warranty/RMA workflow.",
                        'customer_response' => 'Send the serial number, full SMART output, controller details, and diagnostic results so we can compare them with the drive’s tested condition.',
                        'keywords' => ['smart', 'sector', 'bad block', 'throughput', 'slow', 'health', 'failed drive', 'diagnostic'],
                    ],
                ],
            ],
            'Service Requests' => [
                'description' => 'Shipping, fulfillment, warranty, returns, RMA, packaging, and inventory service requests.',
                'articles' => [
                    [
                        'title' => 'Shipping status, delay, or transit damage',
                        'problem' => 'The customer needs tracking help or reports delayed, missing, or physically damaged server hardware.',
                        'agent_steps' => "1. Verify order number, destination, tracking number, and carrier scan history.\n2. Remember that in-stock items target same-day shipping and hard drives/SSDs include free two-day domestic shipping, but do not promise a date unsupported by tracking.\n3. For damage, request photos of the outer package, anti-static protection, internal packaging, item, label, and serial number.\n4. Tell the customer to retain all packaging.\n5. Open a carrier or fulfillment escalation and document whether protective packaging was compromised.",
                        'customer_response' => 'We will review tracking and fulfillment records. For damage, retain all packaging and send clear photos of the box, internal protection, item, and serial label.',
                        'keywords' => ['shipping', 'tracking', 'delayed', 'lost', 'damage', 'packaging', 'delivery'],
                    ],
                    [
                        'title' => 'Warranty and hassle-free RMA workflow',
                        'problem' => 'A tested component appears defective and the customer requests warranty service, replacement, or return.',
                        'agent_steps' => "1. Verify order date, SKU, serial number, warranty period, and requester identity.\n2. Collect symptoms and relevant diagnostics without requiring destructive testing.\n3. Confirm eligibility under the documented warranty and RMA policy.\n4. Issue approved RMA instructions and packaging requirements; do not authorize an untracked return.\n5. Record serial numbers and requested resolution, then communicate inspection and replacement/refund expectations clearly.",
                        'customer_response' => 'Provide the order number, serial number, symptoms, and diagnostics so we can confirm warranty eligibility and issue the correct RMA instructions.',
                        'keywords' => ['warranty', 'rma', 'return', 'replacement', 'defective', 'refund'],
                    ],
                ],
            ],
            'Feature Requests & Feedback' => [
                'description' => 'Product, catalog, documentation, testing-data, and service improvement requests.',
                'articles' => [
                    [
                        'title' => 'Catalog, SKU, or inventory request',
                        'problem' => 'A customer requests an unlisted brand/model, matching replacement, consistent SKU, or future stock notification.',
                        'agent_steps' => "1. Capture exact manufacturer part number, specifications, quantity, acceptable alternatives, and deadline.\n2. Record whether matching firmware, caddies, or batches are mandatory.\n3. Search current inventory and approved incoming-stock information.\n4. Do not offer substitutions without confirming compatibility and customer approval.\n5. Send the documented request to purchasing/catalog teams and set a realistic follow-up expectation.",
                        'customer_response' => 'Share the exact part number, quantity, firmware or matching requirements, and timeline so our inventory team can review the request.',
                        'keywords' => ['feature', 'catalog', 'stock request', 'sku request', 'model', 'inventory', 'notify'],
                    ],
                    [
                        'title' => 'Testing documentation or service feedback',
                        'problem' => 'A customer asks for clearer grading, SMART/testing documentation, packaging improvements, or other service changes.',
                        'agent_steps' => "1. Thank the customer and capture the specific page, product, process, or document involved.\n2. Record the desired outcome and why it affects deployment risk or buying confidence.\n3. Answer from existing documented sector-scan, SMART, throughput, grading, warranty, packaging, or shipping practices.\n4. Do not promise roadmap delivery.\n5. Route actionable feedback to the responsible product, operations, or documentation owner.",
                        'customer_response' => 'Thank you for the detailed feedback. We will document the requested improvement and route it to the responsible team for review.',
                        'keywords' => ['feedback', 'documentation', 'grading', 'testing data', 'smart report', 'packaging improvement'],
                    ],
                ],
            ],
        ];
    }
}
