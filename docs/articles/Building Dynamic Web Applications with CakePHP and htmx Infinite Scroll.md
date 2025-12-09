---
title: Building Dynamic Web Applications with CakePHP and htmx Infinite Scroll
date: 2024-12-04
description: In this tutorial, we'll demonstrate how to implement infinite scroll pagination using htmx in CakePHP applications. Infinite scroll has become a popular user interface pattern, allowing users to seamlessly load more content as they scroll down a page.
tags:
  - CakePHP
  - htmx
  - JavaScript
  - Web Development
  - Tutorial
  - Pagination
---

# Building Dynamic Web Applications with CakePHP and htmx: Infinite Scroll

In this tutorial, we'll demonstrate how to implement infinite scroll pagination using htmx in CakePHP applications. Infinite scroll has become a popular user interface pattern, allowing users to seamlessly load more content as they scroll down a page. We'll implement this pattern for both table and card layouts, showing the flexibility of htmx in handling different UI scenarios.

This article continues our development based on the application created in the previous tutorial. As initial setup, we've added Bootstrap 5 styles to our layout to enhance the visual presentation.

## Implementing Infinite Table Pagination

Our implementation maintains the same controller logic from the previous article, but introduces significant view changes. We've removed the traditional pagination block and instead added pagination functionality as the last table row when there's content to load. This creates a seamless scrolling experience without explicit page numbers. When this last row is revealed, htmx will load the next page of results.

```php
// /templates/Post/infinite.php
<?php
$rows = 0;
?>
<div id="posts" class="posts index content">
<?php $this->start('posts'); ?>
    <?= $this->Html->link(__('New Post'), ['action' => 'add'], ['class' => 'button float-right']) ?>
    <h3><?= __('Posts') ?></h3>
    <div class="table-container">
        <div id="table-loading" class="htmx-indicator">
            <div class="spinner"></div>
        </div>
        <div class="table-responsive">
            <table id="posts-table">
                <thead
                    hx-boost="true"
                    hx-target="#posts"
                    hx-indicator="#table-loading"
                    hx-push-url="true"
                >
                    <tr>
                        <th><?= $this->Paginator->sort('id') ?></th>
                        <th><?= $this->Paginator->sort('title') ?></th>
                        <th><?= $this->Paginator->sort('is_published') ?></th>
                        <th><?= $this->Paginator->sort('created') ?></th>
                        <th><?= $this->Paginator->sort('modified') ?></th>
                        <th class="actions"><?= __('Actions') ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($posts as $post): ?>
                    <tr class="item-container">
                        <td><?= $this->Number->format($post->id) ?></td>
                        <td><?= h($post->title) ?></td>
                        <td><?= h($post->is_published) ?></td>
                        <td><?= h($post->created) ?></td>
                        <td><?= h($post->modified) ?></td>
                        <td class="actions">
                            <?= $this->Html->link(__('View'), ['action' => 'view', $post->id]) ?>
                            <?= $this->Html->link(__('Edit'), ['action' => 'edit', $post->id]) ?>
                            <?= $this->Form->postLink(__('Delete'), ['action' => 'delete', $post->id], ['confirm' => __('Are you sure you want to delete # {0}?', $post->id)]) ?>
                        </td>
                    </tr>
                    <?php $rows++; ?>
                    <?php endforeach; ?>
                    <?php if ($rows > 0): ?>
                        <tr
                            hx-get="<?= $this->Paginator->generateUrl(['page' => $this->Paginator->current() + 1]) ?>"
                            hx-select="#posts-table tbody tr"
                            hx-swap="outerHTML"
                            hx-trigger="intersect"
                            class="infinite-paginator"
                        >
                            <td class="text-center" colspan="6">
                                <div class="d-flex justify-content-center align-items-center py-2">
                                    <i class="fas fa-spinner fa-spin me-2"></i>
                                    <span><?= __('Loading more...') ?></span>
                                </div>
                            </td>
                        </tr>
                        <?php elseif (($this->getRequest()->getQuery('page', 1) == 1)): ?>
                        <tr>
                            <td class="text-center" colspan="6"><?= __('No items found') ?></td>
                        </tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
<?php $this->end(); ?>
<?= $this->fetch('posts'); ?>
</div>
```

The htmx attributes used for table pagination are:
- `hx-get`: Specifies the URL for the next page of results
- `hx-select`: Targets only the table rows from the response
- `hx-swap="outerHTML"`: Replaces the loading row with new content
- `hx-trigger="intersect"`: Activates when the element becomes visible in the viewport
- `class="infinite-paginator"`: Allows styling of the loading indicator

## Card-Based Infinite Pagination

Card-based layouts are increasingly important for modern frontend designs, especially for content-rich applications. This layout style provides better visual hierarchy and improved readability for certain types of content. Instead of bind htmx to last table row, we bind htmx to last card in the grid, and when this card is revealed, htmx will load the next page of results.

```php
// /templates/Post/cards.php
<?php
$rows = 0;
?>
<div id="posts" class="posts index content">
<?php $this->start('posts'); ?>
    <?= $this->Html->link(__('New Post'), ['action' => 'add'], ['class' => 'button float-right']) ?>
    <h3><?= __('Posts') ?></h3>
    <div class="row">
    </div>
    <div class="cards-grid">
        <?php foreach ($posts as $index => $post): ?>
            <div class="card item-container"
                <?php if ($index === count($posts) - 1): ?>
                    hx-get="<?= $this->Paginator->generateUrl(['page' => $this->Paginator->current() + 1]) ?>"
                    hx-trigger="revealed"
                    hx-swap="afterend"
                    hx-select="div.card"
                    hx-target="this"
                    hx-headers='{"HX-Disable-Loader": "true"}'
                    hx-indicator="#infinite-scroll-indicator"
                <?php endif; ?>>

                <div class="card-content">
                    <h3><?= h($post->title) ?></h3>
                    <p class="post-body"><?= h($post->body) ?></h3>
                    <p class="post-created"><?= h($post->created) ?></p>
                </div>
            </div>
            <?php $rows++; ?>
        <?php endforeach; ?>
    </div>
    <?php if ($rows > 0): ?>
        <div id="infinite-scroll-indicator" class="d-flex justify-content-center align-items-center py-3">
            <i class="fas fa-spinner fa-spin me-2"></i>
            <span><?= __('Loading more...') ?></span>
        </div>
    <?php endif; ?>
<?php $this->end(); ?>
<?= $this->fetch('posts'); ?>
</div>
```

The htmx attributes for card-based pagination differ slightly from the table implementation:
- `hx-trigger="revealed"`: Triggers when the last card becomes visible
- `hx-target="this"`: Targets the current card element
- `hx-swap="afterend"`: Places new content after the current element
- `hx-headers`: Disables the default loading indicator

We use `revealed` instead of `intersect` for cards because it provides better control over the trigger point. The `hx-target="this"` is crucial here as it allows us to maintain proper positioning of new cards in the grid layout. Unlike the table implementation, we can't remove the loader div in the same way, which is why we have to use a different approach for handling the loading state.

```css
.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    padding: 1.5rem;
}

.cards-grid .card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    padding: 1rem;
    position: relative;
}

.cards-grid .card-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.cards-grid .post-body {
    display: flex;
    flex-direction: column;
}

.cards-grid .post-created {
    font-weight: bold;
    font-size: 0.875rem;
    color: #666;
}

.cards-grid .field-value {
    margin-top: 0.25rem;
}

@media (max-width: 640px) {
    .cards-grid {
        grid-template-columns: 1fr;
        padding: 1rem;
    }
}

.cards-grid .infinite-scroll-trigger {
    width: 100%;
    min-height: 60px;
    margin-bottom: 1.5rem;
}
```

## Enhanced Table Row Deletion

With infinite loading implemented, we want to avoid full page reloads when deleting items. This creates a more fluid user experience and maintains the scroll position.

### Initial Layout Setup

To support our enhanced deletion functionality, we need to add CSRF protection and pass it to htmx requests.

```php
// /templates/layout/default.php
<meta name="csrf-token" content="<?= $this->request->getAttribute('csrfToken') ?>">
```

We also need to include toast library to display messages.

```php
// /templates/layout/default.php
<?= $this->Html->css('toast'); ?>
<?= $this->Html->script('toast'); ?>
```

### Controller Updates for Delete Action

The delete action now supports two modes: traditional and htmx-based deletion. When using htmx, the response includes a JSON object containing the status message and instructions for removing the deleted item from the DOM.

```php
public function delete($id = null)
{
	$this->request->allowMethod(['post', 'delete']);
	$post = $this->Posts->get($id);
	$deleted = $this->Posts->delete($post);
	if ($deleted) {
		$message = __('The post has been deleted.');
		$status = 'success';
	} else {
		$message = __('The post could not be deleted. Please, try again.');
		$status = 'error';
	}

	if ($this->getRequest()->is('htmx')) {
		$response = [
			'messages' => [
				['message' => $message, 'status' => $status],
			],
			'removeContainer' => true,
		];

		return $this->getResponse()
			->withType('json')
			->withHeader('X-Response-Type', 'json')
			->withStringBody(json_encode($response));

	} else {
		$this->Flash->{$status}($message);

		return $this->redirect(['action' => 'index']);
	}
}
```

### View Updates for Delete Action

We're replacing the standard CakePHP form postLink with a htmx-based delete link. This approach allows us to handle the deletion process entirely through JavaScript, providing a more dynamic and seamless user experience.
We define container class for item to be deleted, in case of table this is `tr.item-container`, in case of cards this is `div.card.item-container`.


#### Standard CakePHP Form PostLink

```php
// /templates/Post/infinite.php
<?= $this->Form->postLink(__('Delete'), ['action' => 'delete', $post->id], ['confirm' => __('Are you sure you want to delete # {0}?', $post->id)]) ?>
```

#### HTMX-Based Delete Link

```php
// /templates/Post/infinite.php
<?php $csrfToken = $this->getRequest()->getAttribute('csrfToken');
$linkOptions = [
	'hx-delete' => $this->Url->build(['action' => 'delete', $post->id]),
	'hx-confirm' => __('Are you sure you want to delete # {0}?', $post->id),
	'hx-target' => 'closest .item-container',
	'hx-headers' => json_encode([
		'X-CSRF-Token' => $csrfToken,
		'Accept' => 'application/json',
	]),
	'href' => 'javascript:void(0)',
];

echo $this->Html->tag('a', __('Delete'), $linkOptions); ?>
```

htmx allow define headers in htmx-delete link, so we can include CSRF token and accept JSON response.

The htmx attributes for deletion:
- `hx-delete`: Specifies the deletion endpoint
- `hx-confirm`: Shows a confirmation dialog
- `hx-target`: Targets the container of the item to be deleted
- `hx-headers`: Includes necessary CSRF token and accepts JSON response

### HTMX JavaScript Callbacks

The JavaScript code handles two main aspects:
1. `configRequest`: Ensures CSRF token is included in all htmx requests
2. `beforeSwap`: Manages the response handling, including:
   - Displaying toast notifications
   - Animating the removal of deleted items
   - Handling page reloads when necessary

```php
// /templates/Post/infinite.php
<script>
let toasts = new Toasts({
    offsetX: 20,
    offsetY: 20,
    gap: 20,
    width: 300,
    timing: 'ease',
    duration: '.5s',
    dimOld: true,
    position: 'top-right',
    dismissible: true,
    autoClose: true,
});

document.addEventListener('htmx:configRequest', function(event) {
    const element = event.detail.elt;
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    if (csrfToken) {
        event.detail.headers['X-CSRF-Token'] = csrfToken;
    }
});
document.addEventListener('htmx:beforeSwap', function(evt) {
    const xhr = evt.detail.xhr;
    const responseType = xhr.getResponseHeader('X-Response-Type');

    if (responseType === 'json') {
        try {
            const data = JSON.parse(xhr.responseText);
            evt.detail.shouldSwap = false;

            if (data.messages) {
                data.messages.forEach(message => {
                    toasts.push({
                        title: message.message,
                        content: '',
                        style: message.status,
                        dismissAfter: '10s',
                        dismissible: true,
                    });
                });
            }

            if (data.removeContainer) {
                const item = evt.detail.target.closest('.item-container');
                if (item) {
                    evt.detail.shouldSwap = false;

                    item.style.transition = 'opacity 0.5s ease-out';
                    item.style.opacity = '0';

                    setTimeout(() => {
                        item.style.transition = 'max-height 0.5s ease-out';
                        item.style.maxHeight = '0';
                        setTimeout(() => {
                            item.remove();
                        }, 500);
                    }, 500);
                }
            }

            if (data.reload) {
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    window.location.reload();
                }
            }
        } catch (e) {
            console.error('JSON parsing error:', e);
        }
    }
});
</script>
```

## Conclusion

Implementing infinite scroll pagination and enhanced deletion with htmx in CakePHP demonstrates the framework's flexibility and htmx's power in creating dynamic interfaces. The combination allows developers to build modern, responsive features with minimal JavaScript while maintaining clean, maintainable code. CakePHP's built-in helpers and htmx's declarative approach work together seamlessly to create a superior user experience.

## Demo Project for Article

The examples used in this article are located at https://github.com/skie/cakephp-htmx/tree/2.0.0 and available for testing.
