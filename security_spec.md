# Firestore Security Specification

## 1. Data Invariants
1. Products can only have prices updated by authenticated administrators or the secure backend service. Public users cannot alter prices.
2. Product URLs must strictly point to `https://www.centrecom.com.au/`.
3. PriceHistory records are immutable audit logs written upon verified price changes.
4. CheaperPriceRequest submissions must contain valid Australian competitor URLs and required customer contact fields. Amazon listings are rejected by business logic.
5. Admin roles and permissions cannot be self-assigned.

## 2. The Dirty Dozen Threat Payloads
1. **Unauthenticated Product Price Override**: Modifying `priceAUD` on a GPU to $0.01 without admin auth. -> `PERMISSION_DENIED`
2. **Ghost Field Injection in Product**: Appending `isFreePromotion: true` to a product. -> `PERMISSION_DENIED`
3. **Malicious Competitor URL in Product**: Changing `productUrl` to an untrusted domain. -> `PERMISSION_DENIED`
4. **Forged Admin Claim**: Attempting to set `role: "admin"` in user profile. -> `PERMISSION_DENIED`
5. **Junk ID Poisoning**: Using a 10KB string for `productId`. -> `PERMISSION_DENIED`
6. **Price History Deletion**: Tampering with or deleting audit trail entries. -> `PERMISSION_DENIED`
7. **Negative Price Injection**: Submitting a negative competitor price. -> `PERMISSION_DENIED`
8. **Email Spoofing**: Attempting admin writes with unverified email token. -> `PERMISSION_DENIED`
9. **Price Match Status Escalation**: Submitting a request directly with `status: "approved"`. -> `PERMISSION_DENIED`
10. **Overlength Notes**: Submitting a 500KB payload in `notes`. -> `PERMISSION_DENIED`
11. **Orphaned Price History**: Writing history for a non-existent product ID. -> `PERMISSION_DENIED`
12. **Blanket Collection Scraping**: Modifying admin documents without permissions. -> `PERMISSION_DENIED`
