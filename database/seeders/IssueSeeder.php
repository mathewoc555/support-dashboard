<?php

namespace Database\Seeders;

use App\Models\Issue;
use Illuminate\Database\Seeder;

class IssueSeeder extends Seeder
{
    public function run(): void
    {
        $issues = [
            ['customer_name' => 'Alex Morgan', 'title' => 'Confirm drive compatibility', 'description' => 'Please confirm whether the listed SAS drive works with a Dell PowerEdge R740 and its existing RAID controller.', 'priority' => 'high', 'category' => 'Technical Issues', 'status' => 'open', 'comment' => 'Requested the server service tag and RAID controller model.'],
            ['customer_name' => 'Jamie Lee', 'title' => 'Duplicate payment authorization', 'description' => 'The customer sees two pending card authorizations for one order and needs the charges reviewed.', 'priority' => 'medium', 'category' => 'Billing', 'status' => 'in_progress', 'comment' => 'Billing is checking the payment gateway transaction references.'],
            ['customer_name' => 'Priya Shah', 'title' => 'RMA request for failed drive', 'description' => 'A recently delivered hard drive reports SMART errors and is no longer detected consistently.', 'priority' => 'high', 'category' => 'Service Requests', 'status' => 'open', 'comment' => 'Asked for the serial number, SMART report, and order number.'],
            ['customer_name' => 'Chris Rivera', 'title' => 'Cannot access order history', 'description' => 'The customer can sign in but the account does not display previous orders.', 'priority' => 'low', 'category' => 'Account & Access Management', 'status' => 'resolved', 'comment' => 'The orders were linked to the correct customer account.'],
            ['customer_name' => 'Morgan Chen', 'title' => 'Request matching inventory alerts', 'description' => 'The customer would like an alert when matching enterprise drive SKUs return to stock.', 'priority' => 'medium', 'category' => 'Feature Requests & Feedback', 'status' => 'in_progress', 'comment' => 'Recorded the requested SKU and quantity for the inventory team.'],
            ['customer_name' => 'Taylor Brooks', 'title' => 'Shipment arrived with damaged packaging', 'description' => 'The outer carton was crushed during transit and the customer wants guidance before installing the enclosed drives.', 'priority' => 'high', 'category' => 'Service Requests', 'status' => 'open', 'comment' => 'Requested photographs of the carton, internal packaging, labels, and affected items.'],
            ['customer_name' => 'Jordan Kim', 'title' => 'Need a bulk quantity discount', 'description' => 'The customer is planning a storage expansion and wants pricing for twenty-four matching enterprise SSDs.', 'priority' => 'low', 'category' => 'Billing', 'status' => 'open', 'comment' => 'Confirmed the requested model, quantity, destination, and purchasing timeline.'],
        ];

        foreach ($issues as $data) {
            $comment = $data['comment'];
            unset($data['comment']);

            $issue = Issue::updateOrCreate(['title' => $data['title']], [
                ...$data,
                'summary_status' => 'pending',
                'summary' => null,
                'suggested_next_action' => null,
                'needs_attention' => $data['priority'] === 'high',
            ]);

            $issue->comments()->updateOrCreate(
                ['body' => $comment],
                ['author_name' => 'Support Admin'],
            );
        }
    }
}
