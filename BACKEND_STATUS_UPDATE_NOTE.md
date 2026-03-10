# Backend Change Request: Enquiry Status Update

## What's Needed

The **Leads page** on the frontend now has "Confirm" and "Cancel" actions to change enquiry status. Currently, status is tracked **frontend-only** via `localStorage`. We need **backend support** to persist it properly.

---

## Changes Required

### 1. Database Migration — Add `status` column to `enquiries` table

```php
// Create migration: php artisan make:migration add_status_to_enquiries_table
Schema::table('enquiries', function (Blueprint $table) {
    $table->string('status')->default('Pending')->after('assigned_to');
    // Possible values: "Pending", "Confirmed", "Cancelled"
});
```

### 2. Enquiry Model — Add `status` to fillable (if using $fillable)

```php
// In Modules/Settings/Entities/Enquiry.php (currently missing from repo)
// Add 'status' to the model's attributes
```

### 3. EnquiriesController — Add `updateStatus()` method

Follow the **exact same pattern** as `TransfersController::updateStatus()` (line 176):

```php
// Add this method to EnquiriesController.php
public function updateStatus(Request $request, $id)
{
    try {
        Validator::make($request->all(), [
            'status' => 'required|in:Pending,Confirmed,Cancelled',
        ])->validate();
        
        $enquiry = Enquiry::findOrFail($id);
        $enquiry->status = $request->status;
        $enquiry->save();
        
        return $this->sendResponse(
            EnquiryResource::make($enquiry),
            'Enquiry Status updated Successfully',
            200
        );
    } catch (Exception $exception) {
        return $this->HandleException($exception);
    }
}
```

### 4. Routes — Add PATCH route in `Modules/Settings/Routes/api.php`

Add this line **after** line 70 (`Route::apiResource('enquiries', ...)`):

```php
Route::patch('enquiry-status-update/{id}', [EnquiriesController::class, 'updateStatus']);
```

### 5. EnquiryResource — Add `status` to response

In `Modules/Settings/Transformers/EnquiryResource.php`, add to the `toArray()` return:

```php
'status' => $this->resource->status,
```

---

## Frontend Integration (already prepared)

Once backend is deployed, the frontend just needs 2 small changes:

1. **`Urls.js`** — Add: `ENQUIRY_STATUS_URL: "/api/enquiry-status-update"`
2. **`Leads.jsx`** — Uncomment the `axiosPatch` call in `handleStatusUpdate` and remove `localStorage` logic

The `TODO` comments in `Leads.jsx` mark exactly where to make these changes.

---

## Reference

This follows the **exact same pattern** already used by:
- `TransfersController::updateStatus()` + `PATCH /api/transfer-status-update/{id}`
- `ActivitiesController::updateStatus()` + `PATCH /api/activity-status-update/{id}`
